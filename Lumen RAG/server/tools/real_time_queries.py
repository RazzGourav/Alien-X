import yfinance as yf
import requests
from typing import Dict, List, Optional
import json
from datetime import datetime
import os
from dotenv import load_dotenv
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import aiohttp
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class RealTimeQueries:
    def __init__(self):
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.session = None
        self.faq_data = {
            "general": [
                {"question": "What is financial planning?", 
                 "answer": "Financial planning is the process of setting and achieving financial goals through proper management of your finances."},
                {"question": "How do I start investing?", 
                 "answer": "Start by setting clear investment goals, understanding your risk tolerance, and diversifying your portfolio across different asset classes."},
                {"question": "What is compound interest?", 
                 "answer": "Compound interest is the interest earned on both the initial principal and the accumulated interest from previous periods."}
            ],
            "market": [
                {"question": "What affects stock prices?", 
                 "answer": "Stock prices are influenced by company performance, market sentiment, economic conditions, and global events."},
                {"question": "What is market volatility?", 
                 "answer": "Market volatility refers to the degree of variation in trading prices over time, indicating the level of risk in the market."}
            ]
        }
        self._stock_cache = {}
        self._news_cache = {}
        self._cache_timeout = 60  # Cache timeout in seconds

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
    def get_stock_price(self, symbol: str) -> Dict:
        """
        Get real-time stock price information for a given symbol with caching.
        """
        try:
            current_time = time.time()
            if symbol in self._stock_cache:
                cached_data, timestamp = self._stock_cache[symbol]
                if current_time - timestamp < self._cache_timeout:
                    return cached_data

            stock = yf.Ticker(symbol)
            info = stock.info
            
            data = {
                "symbol": symbol,
                "current_price": info.get('currentPrice', 'N/A'),
                "previous_close": info.get('previousClose', 'N/A'),
                "day_high": info.get('dayHigh', 'N/A'),
                "day_low": info.get('dayLow', 'N/A'),
                "volume": info.get('volume', 'N/A'),
                "timestamp": datetime.now().isoformat()
            }
            
            self._stock_cache[symbol] = (data, current_time)
            return data
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            return {"error": f"Failed to fetch stock data: {str(e)}"}

    async def get_market_news(self, query: str = "finance", limit: int = 5) -> List[Dict]:
        """
        Get recent news articles related to finance and markets with caching.
        """
        try:
            current_time = time.time()
            cache_key = f"{query}_{limit}"
            
            if cache_key in self._news_cache:
                cached_data, timestamp = self._news_cache[cache_key]
                if current_time - timestamp < self._cache_timeout:
                    return cached_data

            if not self.session:
                await self.initialize()

            url = "https://newsapi.org/v2/everything"
            params = {
                "q": query,
                "apiKey": self.news_api_key,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": limit
            }
            
            async with self.session.get(url, params=params) as response:
                data = await response.json()
                
                if data.get("status") == "ok":
                    articles = data.get("articles", [])
                    result = [{
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "url": article.get("url"),
                        "published_at": article.get("publishedAt")
                    } for article in articles[:limit]]
                    
                    self._news_cache[cache_key] = (result, current_time)
                    return result
                else:
                    return [{"error": "Failed to fetch news"}]
        except Exception as e:
            logger.error(f"Error fetching news: {str(e)}")
            return [{"error": f"Failed to fetch news: {str(e)}"}]

    def get_faq_answer(self, question: str) -> Dict:
        """
        Get answer for frequently asked questions with fuzzy matching.
        """
        question = question.lower()
        
        # Search in all FAQ categories
        for category, faqs in self.faq_data.items():
            for faq in faqs:
                if question in faq["question"].lower():
                    return {
                        "question": faq["question"],
                        "answer": faq["answer"],
                        "category": category
                    }
        
        return {
            "error": "No matching FAQ found",
            "suggestion": "Try rephrasing your question or check our documentation for more information."
        }

    async def process_query(self, query: str) -> Dict:
        """
        Process a real-time query and return appropriate response.
        """
        query = query.lower()
        
        # Check if it's a stock price query
        if "price" in query or "stock" in query:
            # Extract stock symbol (basic implementation)
            words = query.split()
            for word in words:
                if word.isupper() and len(word) <= 5:  # Basic symbol detection
                    return await asyncio.get_event_loop().run_in_executor(
                        self.executor, self.get_stock_price, word
                    )
        
        # Check if it's a news query
        elif "news" in query or "latest" in query:
            return {"news": await self.get_market_news()}
        
        # Check if it's a FAQ query
        else:
            return self.get_faq_answer(query)

# FastAPI application setup
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create RealTimeQueries instance
rtq = RealTimeQueries()

@app.on_event("startup")
async def startup_event():
    await rtq.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    await rtq.cleanup()

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                response = await rtq.process_query(message.get("query", ""))
                await websocket.send_json(response)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid message format"})
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                await websocket.send_json({"error": str(e)})
    except WebSocketDisconnect:
        logger.info("Client disconnected")

# REST endpoints
@app.get("/stock/{symbol}")
async def get_stock(symbol: str):
    return await asyncio.get_event_loop().run_in_executor(
        rtq.executor, rtq.get_stock_price, symbol
    )

@app.get("/news")
async def get_news(query: str = "finance", limit: int = 5):
    return await rtq.get_market_news(query, limit)

@app.get("/faq")
async def get_faq(question: str):
    return rtq.get_faq_answer(question)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 