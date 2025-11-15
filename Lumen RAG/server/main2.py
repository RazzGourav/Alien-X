import os
import pandas as pd
from tempfile import NamedTemporaryFile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
import json
from flask_sock import Sock
import threading
import time

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the current directory to the Python path to handle imports
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the financial report generator
from tools.Tool_1_Financial_Report_Generator import generate_financial_report

# Import the personalized financial advisor
from tools.personalized_financial_advisor import (
    process_financial_document,
    get_financial_advice,
    update_user_preferences
)

# Import the market trend analyzer
from tools.market_trend_analyzer import MarketTrendAnalyzer

# Import the real-time queries
from tools.real_time_queries import RealTimeQueries

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
sock = Sock(app)  # Initialize WebSocket support

# Initialize analyzers
analyzer = MarketTrendAnalyzer()
rtq = RealTimeQueries()

# Ensure the reports directory exists
os.makedirs("reports", exist_ok=True)
os.makedirs("reports/charts", exist_ok=True)

# Initialize thread pool for async operations
thread_pool = ThreadPoolExecutor(max_workers=10)

# WebSocket connections
active_connections = {}

def initialize_app():
    """Initialize the analyzers"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(analyzer.initialize())
    loop.run_until_complete(rtq.initialize())
    loop.close()

@app.teardown_appcontext
def cleanup(exception=None):
    """Cleanup resources when the app context is torn down"""
    # Run async cleanup in a separate thread
    def run_async_cleanup():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(analyzer.cleanup())
        loop.run_until_complete(rtq.cleanup())
        loop.close()
    
    thread = threading.Thread(target=run_async_cleanup)
    thread.start()
    thread.join(timeout=5)  # Wait up to 5 seconds for cleanup

# WebSocket endpoint for real-time queries
@sock.route('/ws')
def websocket_endpoint(ws):
    """Handle WebSocket connections for real-time queries"""
    client_id = id(ws)
    active_connections[client_id] = ws
    
    try:
        while True:
            data = ws.receive()
            try:
                message = json.loads(data)
                query = message.get("query", "")
                
                # Process the query asynchronously
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                response = loop.run_until_complete(rtq.process_query(query))
                loop.close()
                
                ws.send(json.dumps(response))
            except json.JSONDecodeError:
                ws.send(json.dumps({"error": "Invalid message format"}))
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                ws.send(json.dumps({"error": str(e)}))
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        if client_id in active_connections:
            del active_connections[client_id]

# Real-time Queries Routes
@app.route('/stock/<symbol>', methods=['GET'])
async def get_stock(symbol):
    """Get real-time stock price for a symbol"""
    try:
        result = await asyncio.get_event_loop().run_in_executor(
            thread_pool, rtq.get_stock_price, symbol
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting stock price: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/news', methods=['GET'])
async def get_news():
    """Get market news"""
    try:
        query = request.args.get('query', 'finance')
        limit = int(request.args.get('limit', 5))
        result = await rtq.get_market_news(query, limit)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting news: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/faq', methods=['GET'])
async def get_faq():
    """Get FAQ answer"""
    try:
        question = request.args.get('question', '')
        if not question:
            return jsonify({"error": "Question is required"}), 400
            
        result = rtq.get_faq_answer(question)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting FAQ: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Market Trend Analyzer Routes
@app.route('/analyze', methods=['POST'])
async def analyze_investment():
    """Analyze investment potential for a symbol"""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        company_name = data.get('company_name')
        
        if not symbol:
            return jsonify({"error": "Symbol is required"}), 400
            
        result = await analyzer.analyze_investment(symbol, company_name)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/stock-analysis/<symbol>', methods=['GET'])
async def get_stock_analysis(symbol):
    """Get stock analysis for a symbol"""
    try:
        company_name = request.args.get('company_name')
        result = await analyzer.analyze_investment(symbol, company_name)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in stock endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/technical/<symbol>', methods=['GET'])
async def get_technical_analysis(symbol):
    """Get technical analysis for a symbol"""
    try:
        df = analyzer.get_historical_data(symbol)
        result = analyzer.calculate_technical_indicators(df)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in technical endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/sentiment/<symbol>', methods=['GET'])
async def get_sentiment_analysis(symbol):
    """Get sentiment analysis for a symbol"""
    try:
        company_name = request.args.get('company_name')
        news_sentiment = await analyzer.get_news_sentiment(symbol, company_name)
        social_sentiment = await analyzer.get_social_sentiment(symbol)
        
        return jsonify({
            "news_sentiment": news_sentiment,
            "social_sentiment": social_sentiment,
            "combined_sentiment": {
                "score": (news_sentiment.get("raw_sentiment", 0) + social_sentiment.get("raw_sentiment", 0)) / 2,
                "category": "positive" if (news_sentiment.get("raw_sentiment", 0) + social_sentiment.get("raw_sentiment", 0)) / 2 > 0.1 
                          else "negative" if (news_sentiment.get("raw_sentiment", 0) + social_sentiment.get("raw_sentiment", 0)) / 2 < -0.1 
                          else "neutral"
            }
        })
    except Exception as e:
        logger.error(f"Error in sentiment endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/fundamental/<symbol>', methods=['GET'])
async def get_fundamental_analysis(symbol):
    """Get fundamental analysis for a symbol"""
    try:
        result = analyzer.get_fundamental_analysis(symbol)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in fundamental endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/chart/<symbol>', methods=['GET'])
async def get_price_chart(symbol):
    """Get price chart for a symbol"""
    try:
        period = request.args.get('period', '1y')
        if period not in ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max']:
            return jsonify({"error": "Invalid period"}), 400
            
        chart = analyzer.generate_price_chart(symbol, period)
        if not chart:
            return jsonify({"error": "Chart could not be generated"}), 404
            
        return jsonify({"chart": chart})
    except Exception as e:
        logger.error(f"Error in chart endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Original Main Server Routes
@app.route('/')
def root():
    return jsonify({"message": "Finance RAG Application Server is running"})

@app.route('/generate-stock-report', methods=['POST'])
def generate_stock_report():
    """Generate a financial report for a stock symbol."""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        data_type = data.get('data_type', 'organization')
        
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
            
        report_path = generate_financial_report(
            data_source=symbol,
            data_type=data_type
        )
        return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/generate-data-report', methods=['POST'])
def generate_data_report():
    """Generate a financial report from JSON data."""
    try:
        data = request.get_json()
        financial_data = data.get('data')
        data_type = data.get('data_type', 'individual')
        
        if not financial_data:
            return jsonify({"error": "Financial data is required"}), 400
            
        # Convert the JSON data to a DataFrame
        df = pd.DataFrame(financial_data)
        report_path = generate_financial_report(
            data_source=df,
            data_type=data_type
        )
        return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/upload-file-report', methods=['POST'])
def upload_file_report():
    """Generate a financial report from an uploaded file (CSV, Excel, JSON)."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        data_type = request.form.get('data_type', 'individual')
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file:
            filename = secure_filename(file.filename)
            file_ext = os.path.splitext(filename)[1].lower()
            
            if file_ext not in ['.csv', '.xlsx', '.xls', '.json']:
                return jsonify({"error": "Unsupported file format"}), 400
                
            # Create a temporary file to store the uploaded content
            with NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                file.save(temp_file.name)
                temp_path = temp_file.name

            # Generate the report from the file
            report_path = generate_financial_report(
                data_source=temp_path,
                data_type=data_type
            )

            # Clean up the temporary file
            os.unlink(temp_path)
            
            return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/reports/<filename>')
def get_report(filename):
    """Download a generated report file."""
    file_path = f"reports/{filename}"
    if not os.path.isfile(file_path):
        return jsonify({"error": "Report file not found"}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/reports/charts/<filename>')
def get_chart(filename):
    """Download a generated chart file."""
    file_path = f"reports/charts/{filename}"
    if not os.path.isfile(file_path):
        return jsonify({"error": "Chart file not found"}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/example')
def run_example():
    """Run the example reports for testing."""
    try:
        # Example 1: Individual data
        sample_individual_data = pd.DataFrame({
            'period': ['Jan', 'Feb', 'Mar', 'Apr'],
            'revenue': [10000, 12000, 9500, 15000],
            'expenses': [8000, 7500, 8200, 9000]
        })
        individual_report = generate_financial_report(sample_individual_data, "individual")
        
        # Example 2: Organizational data (stock symbol)
        org_report = generate_financial_report("AAPL", "organization")
        
        return jsonify({
            "success": True, 
            "individual_report": individual_report,
            "organization_report": org_report
        })
    except Exception as e:
        return jsonify({"error": f"Error running example: {str(e)}"}), 500

@app.route('/process-document', methods=['POST'])
def process_document_api():
    try:
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Save uploaded file - FIXED PATH HERE
        document_path = f"data/documents/{user_id}/{secure_filename(file.filename)}"
        os.makedirs(os.path.dirname(document_path), exist_ok=True)
        file.save(document_path)
        
        # Process document
        result = process_financial_document(document_path, user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route('/get-advice', methods=['POST'])
def get_advice_api():
    try:
        data = request.get_json()
        query = data.get('query')
        user_id = data.get('user_id')
        document_path = data.get('document_path')
        
        if not query or not user_id:
            return jsonify({"error": "Query and user_id are required"}), 400
        
        # Call financial advisor with document context
        response = get_financial_advice(query, user_id, document_path)
        
        return jsonify({
            "response": response,
            "sources": []  # Add source extraction logic if needed
        })
    except Exception as e:
        return jsonify({"error": f"Error getting advice: {str(e)}"}), 500

@app.route('/update-preferences', methods=['POST'])
def update_preferences_api():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        preferences = data.get('preferences')
        
        if not user_id or not preferences:
            return jsonify({"error": "User ID and preferences are required"}), 400
            
        updated_profile = update_user_preferences(user_id, preferences)
        return jsonify({"profile": updated_profile})
    except Exception as e:
        return jsonify({"error": f"Error updating preferences: {str(e)}"}), 500

@app.route('/user-files', methods=['GET'])
def user_files_api():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Look in multiple possible directories
        document_paths = [
            f"data/documents/{user_id}",
            f"data/chat_documents/{user_id}",
            f"data/uploaded_files/{user_id}"
        ]
        
        files = []
        for path in document_paths:
            if os.path.exists(path):
                for file_name in os.listdir(path):
                    file_path = os.path.join(path, file_name)
                    if os.path.isfile(file_path):
                        files.append({
                            "id": file_path,  # Use full path as ID
                            "name": file_name
                        })
                
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": f"Error listing user files: {str(e)}"}), 500

if __name__ == "__main__":
    # Initialize components before starting the app
    initialize_app()
    app.run(host="0.0.0.0", port=5000, debug=True)