import yfinance as yf
import pandas as pd
import numpy as np
import requests
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Union
from dotenv import load_dotenv
import logging
from textblob import TextBlob
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import matplotlib.pyplot as plt
from io import BytesIO
import base64
from concurrent.futures import ThreadPoolExecutor
import asyncio
import aiohttp
from functools import lru_cache

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class MarketTrendAnalyzer:
    def __init__(self):
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.session = None
        self._cache = {}
        self._cache_timeout = 3600  # 1 hour cache timeout

    async def initialize(self):
        """Initialize aiohttp session"""
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
            self.session = None
        self.executor.shutdown()

    @lru_cache(maxsize=100)
    def get_historical_data(self, symbol: str, period: str = "1y") -> pd.DataFrame:
        """
        Get historical price data for a symbol.
        """
        try:
            stock = yf.Ticker(symbol)
            df = stock.history(period=period)
            return df
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return pd.DataFrame()

    def calculate_technical_indicators(self, df: pd.DataFrame) -> Dict:
        """
        Calculate technical indicators for trend analysis.
        """
        if df.empty:
            return {"error": "No data available"}

        try:
            # Calculate moving averages
            df['SMA_20'] = df['Close'].rolling(window=20).mean()
            df['SMA_50'] = df['Close'].rolling(window=50).mean()
            df['SMA_200'] = df['Close'].rolling(window=200).mean()
            
            # Calculate RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            
            # Calculate MACD
            exp1 = df['Close'].ewm(span=12, adjust=False).mean()
            exp2 = df['Close'].ewm(span=26, adjust=False).mean()
            df['MACD'] = exp1 - exp2
            df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
            
            # Calculate Bollinger Bands
            df['BB_middle'] = df['Close'].rolling(window=20).mean()
            df['BB_std'] = df['Close'].rolling(window=20).std()
            df['BB_upper'] = df['BB_middle'] + (df['BB_std'] * 2)
            df['BB_lower'] = df['BB_middle'] - (df['BB_std'] * 2)
            
            # Get latest values
            latest = df.iloc[-1]
            
            # Determine trend
            trend = "Bullish" if latest['Close'] > latest['SMA_200'] else "Bearish"
            
            # Determine RSI signal
            rsi_signal = "Overbought" if latest['RSI'] > 70 else "Oversold" if latest['RSI'] < 30 else "Neutral"
            
            # Determine MACD signal
            macd_signal = "Bullish" if latest['MACD'] > latest['Signal_Line'] else "Bearish"
            
            # Determine Bollinger Band signal
            bb_signal = "Overbought" if latest['Close'] > latest['BB_upper'] else "Oversold" if latest['Close'] < latest['BB_lower'] else "Neutral"
            
            return {
                "trend": trend,
                "current_price": latest['Close'],
                "sma_20": latest['SMA_20'],
                "sma_50": latest['SMA_50'],
                "sma_200": latest['SMA_200'],
                "rsi": latest['RSI'],
                "rsi_signal": rsi_signal,
                "macd": latest['MACD'],
                "macd_signal": macd_signal,
                "bb_signal": bb_signal,
                "volume": latest['Volume'],
                "volatility": df['Close'].pct_change().std() * np.sqrt(252)  # Annualized volatility
            }
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {str(e)}")
            return {"error": f"Error calculating technical indicators: {str(e)}"}

    async def get_news_sentiment(self, symbol: str, company_name: Optional[str] = None) -> Dict:
        """
        Get news sentiment for a symbol or company.
        """
        try:
            if not self.session:
                await self.initialize()
                
            # Use company name if provided, otherwise use symbol
            query = company_name if company_name else symbol
            
            url = "https://newsapi.org/v2/everything"
            params = {
                "q": query,
                "apiKey": self.news_api_key,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 20
            }
            
            async with self.session.get(url, params=params) as response:
                data = await response.json()
                
                if data.get("status") == "ok":
                    articles = data.get("articles", [])
                    
                    if not articles:
                        return {"sentiment": "neutral", "confidence": 0.5, "articles": []}
                    
                    # Analyze sentiment for each article
                    sentiments = []
                    for article in articles:
                        title = article.get("title", "")
                        description = article.get("description", "")
                        content = f"{title} {description}"
                        
                        # Use TextBlob for sentiment analysis
                        blob = TextBlob(content)
                        sentiments.append(blob.sentiment.polarity)
                    
                    # Calculate average sentiment
                    avg_sentiment = sum(sentiments) / len(sentiments)
                    
                    # Determine sentiment category
                    if avg_sentiment > 0.1:
                        sentiment_category = "positive"
                    elif avg_sentiment < -0.1:
                        sentiment_category = "negative"
                    else:
                        sentiment_category = "neutral"
                    
                    # Calculate confidence (absolute value of sentiment)
                    confidence = abs(avg_sentiment)
                    
                    return {
                        "sentiment": sentiment_category,
                        "confidence": confidence,
                        "raw_sentiment": avg_sentiment,
                        "articles": articles[:5]  # Return top 5 articles
                    }
                else:
                    return {"sentiment": "neutral", "confidence": 0.5, "articles": []}
        except Exception as e:
            logger.error(f"Error getting news sentiment: {str(e)}")
            return {"sentiment": "neutral", "confidence": 0.5, "articles": []}

    async def get_social_sentiment(self, symbol: str) -> Dict:
        """
        Get social media sentiment for a symbol.
        This is a placeholder for actual social media API integration.
        """
        # In a real implementation, this would connect to Twitter, Reddit, etc.
        # For now, we'll return a simulated sentiment
        try:
            # Simulate API call delay
            await asyncio.sleep(0.5)
            
            # Simulate sentiment data
            sentiment_score = np.random.normal(0.2, 0.5)  # Slightly positive bias
            sentiment_score = max(min(sentiment_score, 1), -1)  # Clamp to [-1, 1]
            
            if sentiment_score > 0.1:
                sentiment_category = "positive"
            elif sentiment_score < -0.1:
                sentiment_category = "negative"
            else:
                sentiment_category = "neutral"
            
            return {
                "sentiment": sentiment_category,
                "confidence": abs(sentiment_score),
                "raw_sentiment": sentiment_score,
                "sources": ["Twitter", "Reddit", "StockTwits"]
            }
        except Exception as e:
            logger.error(f"Error getting social sentiment: {str(e)}")
            return {"sentiment": "neutral", "confidence": 0.5, "sources": []}

    def get_fundamental_analysis(self, symbol: str) -> Dict:
        """
        Get fundamental analysis for a symbol.
        """
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # Extract key metrics
            metrics = {
                "market_cap": info.get('marketCap', 'N/A'),
                "pe_ratio": info.get('trailingPE', 'N/A'),
                "forward_pe": info.get('forwardPE', 'N/A'),
                "peg_ratio": info.get('pegRatio', 'N/A'),
                "dividend_yield": info.get('dividendYield', 'N/A'),
                "beta": info.get('beta', 'N/A'),
                "profit_margins": info.get('profitMargins', 'N/A'),
                "revenue_growth": info.get('revenueGrowth', 'N/A'),
                "earnings_growth": info.get('earningsGrowth', 'N/A'),
                "debt_to_equity": info.get('debtToEquity', 'N/A'),
                "current_ratio": info.get('currentRatio', 'N/A'),
                "quick_ratio": info.get('quickRatio', 'N/A'),
                "roa": info.get('returnOnAssets', 'N/A'),
                "roe": info.get('returnOnEquity', 'N/A'),
                "sector": info.get('sector', 'N/A'),
                "industry": info.get('industry', 'N/A'),
                "country": info.get('country', 'N/A')
            }
            
            # Calculate valuation score
            valuation_score = 0
            if isinstance(metrics['pe_ratio'], (int, float)) and metrics['pe_ratio'] > 0:
                if metrics['pe_ratio'] < 15:
                    valuation_score += 2
                elif metrics['pe_ratio'] < 25:
                    valuation_score += 1
            
            if isinstance(metrics['peg_ratio'], (int, float)) and metrics['peg_ratio'] > 0:
                if metrics['peg_ratio'] < 1:
                    valuation_score += 2
                elif metrics['peg_ratio'] < 1.5:
                    valuation_score += 1
            
            if isinstance(metrics['dividend_yield'], (int, float)) and metrics['dividend_yield'] > 0:
                if metrics['dividend_yield'] > 0.03:
                    valuation_score += 1
            
            # Calculate financial health score
            health_score = 0
            if isinstance(metrics['debt_to_equity'], (int, float)) and metrics['debt_to_equity'] > 0:
                if metrics['debt_to_equity'] < 1:
                    health_score += 2
                elif metrics['debt_to_equity'] < 2:
                    health_score += 1
            
            if isinstance(metrics['current_ratio'], (int, float)) and metrics['current_ratio'] > 0:
                if metrics['current_ratio'] > 2:
                    health_score += 2
                elif metrics['current_ratio'] > 1:
                    health_score += 1
            
            if isinstance(metrics['quick_ratio'], (int, float)) and metrics['quick_ratio'] > 0:
                if metrics['quick_ratio'] > 1:
                    health_score += 1
            
            # Calculate profitability score
            profitability_score = 0
            if isinstance(metrics['profit_margins'], (int, float)) and metrics['profit_margins'] > 0:
                if metrics['profit_margins'] > 0.2:
                    profitability_score += 2
                elif metrics['profit_margins'] > 0.1:
                    profitability_score += 1
            
            if isinstance(metrics['roa'], (int, float)) and metrics['roa'] > 0:
                if metrics['roa'] > 0.1:
                    profitability_score += 1
            
            if isinstance(metrics['roe'], (int, float)) and metrics['roe'] > 0:
                if metrics['roe'] > 0.15:
                    profitability_score += 1
            
            # Calculate growth score
            growth_score = 0
            if isinstance(metrics['revenue_growth'], (int, float)) and metrics['revenue_growth'] > 0:
                if metrics['revenue_growth'] > 0.2:
                    growth_score += 2
                elif metrics['revenue_growth'] > 0.1:
                    growth_score += 1
            
            if isinstance(metrics['earnings_growth'], (int, float)) and metrics['earnings_growth'] > 0:
                if metrics['earnings_growth'] > 0.2:
                    growth_score += 2
                elif metrics['earnings_growth'] > 0.1:
                    growth_score += 1
            
            # Calculate overall fundamental score (0-10)
            total_score = valuation_score + health_score + profitability_score + growth_score
            
            # Determine fundamental rating
            if total_score >= 7:
                fundamental_rating = "Strong Buy"
            elif total_score >= 5:
                fundamental_rating = "Buy"
            elif total_score >= 3:
                fundamental_rating = "Hold"
            elif total_score >= 1:
                fundamental_rating = "Sell"
            else:
                fundamental_rating = "Strong Sell"
            
            return {
                "metrics": metrics,
                "valuation_score": valuation_score,
                "health_score": health_score,
                "profitability_score": profitability_score,
                "growth_score": growth_score,
                "total_score": total_score,
                "rating": fundamental_rating
            }
        except Exception as e:
            logger.error(f"Error getting fundamental analysis: {str(e)}")
            return {"error": f"Error getting fundamental analysis: {str(e)}"}

    def generate_price_chart(self, symbol: str, period: str = "1y") -> str:
        """
        Generate a price chart for a symbol and return as base64 encoded image.
        """
        try:
            df = self.get_historical_data(symbol, period)
            
            if df.empty:
                return ""
            
            plt.figure(figsize=(10, 6))
            plt.plot(df.index, df['Close'], label='Close Price')
            plt.plot(df.index, df['SMA_20'], label='20-day SMA')
            plt.plot(df.index, df['SMA_50'], label='50-day SMA')
            plt.plot(df.index, df['SMA_200'], label='200-day SMA')
            
            plt.title(f'{symbol} Price Chart ({period})')
            plt.xlabel('Date')
            plt.ylabel('Price')
            plt.legend()
            plt.grid(True)
            
            # Save plot to BytesIO
            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            plt.close()
            
            # Encode as base64
            img_str = base64.b64encode(buf.read()).decode('utf-8')
            return img_str
        except Exception as e:
            logger.error(f"Error generating price chart: {str(e)}")
            return ""

    async def analyze_investment(self, symbol: str, company_name: Optional[str] = None) -> Dict:
        """
        Analyze investment potential for a symbol.
        """
        try:
            # Get historical data and technical indicators
            df = self.get_historical_data(symbol)
            technical = self.calculate_technical_indicators(df)
            
            # Get news sentiment
            news_sentiment = await self.get_news_sentiment(symbol, company_name)
            
            # Get social sentiment
            social_sentiment = await self.get_social_sentiment(symbol)
            
            # Get fundamental analysis
            fundamental = self.get_fundamental_analysis(symbol)
            
            # Generate price chart
            chart = self.generate_price_chart(symbol)
            
            # Calculate overall sentiment score
            sentiment_score = 0
            if news_sentiment.get("sentiment") == "positive":
                sentiment_score += 1
            elif news_sentiment.get("sentiment") == "negative":
                sentiment_score -= 1
                
            if social_sentiment.get("sentiment") == "positive":
                sentiment_score += 1
            elif social_sentiment.get("sentiment") == "negative":
                sentiment_score -= 1
            
            # Calculate technical score
            technical_score = 0
            if technical.get("trend") == "Bullish":
                technical_score += 2
            elif technical.get("trend") == "Bearish":
                technical_score -= 2
                
            if technical.get("rsi_signal") == "Oversold":
                technical_score += 1
            elif technical.get("rsi_signal") == "Overbought":
                technical_score -= 1
                
            if technical.get("macd_signal") == "Bullish":
                technical_score += 1
            elif technical.get("macd_signal") == "Bearish":
                technical_score -= 1
                
            if technical.get("bb_signal") == "Oversold":
                technical_score += 1
            elif technical.get("bb_signal") == "Overbought":
                technical_score -= 1
            
            # Get fundamental score
            fundamental_score = fundamental.get("total_score", 0)
            
            # Calculate overall investment score (0-10)
            overall_score = (sentiment_score + 5) / 2 + technical_score + fundamental_score / 2
            overall_score = max(min(overall_score, 10), 0)  # Clamp to [0, 10]
            
            # Determine investment recommendation
            if overall_score >= 7:
                recommendation = "Strong Buy"
            elif overall_score >= 5:
                recommendation = "Buy"
            elif overall_score >= 3:
                recommendation = "Hold"
            elif overall_score >= 1:
                recommendation = "Sell"
            else:
                recommendation = "Strong Sell"
            
            # Generate investment thesis
            thesis = self.generate_investment_thesis(
                symbol, 
                technical, 
                news_sentiment, 
                social_sentiment, 
                fundamental, 
                overall_score
            )
            
            return {
                "symbol": symbol,
                "company_name": company_name,
                "technical_analysis": technical,
                "news_sentiment": news_sentiment,
                "social_sentiment": social_sentiment,
                "fundamental_analysis": fundamental,
                "sentiment_score": sentiment_score,
                "technical_score": technical_score,
                "fundamental_score": fundamental_score,
                "overall_score": overall_score,
                "recommendation": recommendation,
                "thesis": thesis,
                "chart": chart,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error analyzing investment: {str(e)}")
            return {"error": f"Error analyzing investment: {str(e)}"}

    def generate_investment_thesis(
        self, 
        symbol: str, 
        technical: Dict, 
        news_sentiment: Dict, 
        social_sentiment: Dict, 
        fundamental: Dict, 
        overall_score: float
    ) -> str:
        """
        Generate an investment thesis based on the analysis.
        """
        try:
            # Start with a general introduction
            thesis = f"Investment Analysis for {symbol}\n\n"
            
            # Add technical analysis summary
            thesis += "Technical Analysis:\n"
            thesis += f"- Current Trend: {technical.get('trend', 'Unknown')}\n"
            thesis += f"- RSI: {technical.get('rsi', 'N/A')} ({technical.get('rsi_signal', 'Unknown')})\n"
            thesis += f"- MACD: {technical.get('macd_signal', 'Unknown')}\n"
            thesis += f"- Bollinger Bands: {technical.get('bb_signal', 'Unknown')}\n"
            thesis += f"- Volatility: {technical.get('volatility', 'N/A')}\n\n"
            
            # Add sentiment analysis summary
            thesis += "Sentiment Analysis:\n"
            thesis += f"- News Sentiment: {news_sentiment.get('sentiment', 'Unknown')} (Confidence: {news_sentiment.get('confidence', 'N/A')})\n"
            thesis += f"- Social Sentiment: {social_sentiment.get('sentiment', 'Unknown')} (Confidence: {social_sentiment.get('confidence', 'N/A')})\n\n"
            
            # Add fundamental analysis summary
            thesis += "Fundamental Analysis:\n"
            thesis += f"- Valuation Score: {fundamental.get('valuation_score', 'N/A')}/5\n"
            thesis += f"- Financial Health Score: {fundamental.get('health_score', 'N/A')}/5\n"
            thesis += f"- Profitability Score: {fundamental.get('profitability_score', 'N/A')}/5\n"
            thesis += f"- Growth Score: {fundamental.get('growth_score', 'N/A')}/5\n"
            thesis += f"- Total Fundamental Score: {fundamental.get('total_score', 'N/A')}/10\n\n"
            
            # Add recommendation
            thesis += f"Overall Investment Score: {overall_score}/10\n"
            thesis += f"Recommendation: {self.get_recommendation_text(overall_score)}\n\n"
            
            # Add key factors
            thesis += "Key Factors:\n"
            
            # Technical factors
            if technical.get('trend') == "Bullish":
                thesis += "- Positive price trend above 200-day moving average\n"
            elif technical.get('trend') == "Bearish":
                thesis += "- Negative price trend below 200-day moving average\n"
                
            if technical.get('rsi_signal') == "Oversold":
                thesis += "- RSI indicates oversold conditions, potential buying opportunity\n"
            elif technical.get('rsi_signal') == "Overbought":
                thesis += "- RSI indicates overbought conditions, potential selling opportunity\n"
            
            # Sentiment factors
            if news_sentiment.get('sentiment') == "positive":
                thesis += "- Positive news sentiment indicates favorable market perception\n"
            elif news_sentiment.get('sentiment') == "negative":
                thesis += "- Negative news sentiment indicates unfavorable market perception\n"
                
            if social_sentiment.get('sentiment') == "positive":
                thesis += "- Positive social sentiment indicates strong retail investor interest\n"
            elif social_sentiment.get('sentiment') == "negative":
                thesis += "- Negative social sentiment indicates weak retail investor interest\n"
            
            # Fundamental factors
            if fundamental.get('valuation_score', 0) >= 3:
                thesis += "- Attractive valuation metrics compared to peers\n"
            elif fundamental.get('valuation_score', 0) <= 1:
                thesis += "- Expensive valuation metrics compared to peers\n"
                
            if fundamental.get('health_score', 0) >= 3:
                thesis += "- Strong financial health with good balance sheet metrics\n"
            elif fundamental.get('health_score', 0) <= 1:
                thesis += "- Weak financial health with concerning balance sheet metrics\n"
                
            if fundamental.get('profitability_score', 0) >= 3:
                thesis += "- Strong profitability with good margins and returns\n"
            elif fundamental.get('profitability_score', 0) <= 1:
                thesis += "- Weak profitability with concerning margins and returns\n"
                
            if fundamental.get('growth_score', 0) >= 3:
                thesis += "- Strong growth trajectory with increasing revenues and earnings\n"
            elif fundamental.get('growth_score', 0) <= 1:
                thesis += "- Weak growth trajectory with declining or stagnant revenues and earnings\n"
            
            # Add conclusion
            thesis += "\nConclusion:\n"
            thesis += self.get_conclusion_text(overall_score, symbol)
            
            return thesis
        except Exception as e:
            logger.error(f"Error generating investment thesis: {str(e)}")
            return f"Error generating investment thesis: {str(e)}"

    def get_recommendation_text(self, score: float) -> str:
        """
        Get recommendation text based on score.
        """
        if score >= 7:
            return "Strong Buy - High potential for significant returns with acceptable risk"
        elif score >= 5:
            return "Buy - Good potential for returns with moderate risk"
        elif score >= 3:
            return "Hold - Maintain current position, monitor for changes"
        elif score >= 1:
            return "Sell - Consider reducing position to minimize potential losses"
        else:
            return "Strong Sell - High risk of significant losses, consider exiting position"

    def get_conclusion_text(self, score: float, symbol: str) -> str:
        """
        Get conclusion text based on score.
        """
        if score >= 7:
            return f"{symbol} presents a compelling investment opportunity with strong technical, fundamental, and sentiment indicators. The overall analysis suggests significant upside potential with acceptable risk. Consider establishing a position with a long-term investment horizon."
        elif score >= 5:
            return f"{symbol} shows favorable investment characteristics with positive technical trends, reasonable valuations, and generally positive sentiment. While some risks exist, the overall profile suggests good potential for returns. Consider adding to existing positions or initiating a new position."
        elif score >= 3:
            return f"{symbol} displays mixed signals with some positive and negative factors. The technical, fundamental, and sentiment analyses don't provide a clear directional bias. Maintain current positions if you already own the stock, or wait for clearer signals before establishing a new position."
        elif score >= 1:
            return f"{symbol} shows concerning investment characteristics with negative technical trends, expensive valuations, and generally negative sentiment. The overall analysis suggests downside risk. Consider reducing existing positions or avoiding new investments until conditions improve."
        else:
            return f"{symbol} presents significant investment risks with poor technical, fundamental, and sentiment indicators. The overall analysis suggests high potential for losses. Consider exiting existing positions or avoiding investment until conditions significantly improve." 