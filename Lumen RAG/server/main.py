import os
import pandas as pd
from tempfile import NamedTemporaryFile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import uuid
import sys
import types
import importlib

# --- BEGIN PATCH: provide shim for langgraph.checkpoint.memory to avoid pydantic schema error on import ---
# Create a lightweight shim module to satisfy `from langgraph.checkpoint.memory import MemorySaver`
# This avoids importing langgraph.checkpoint.memory during startup (prevents Pydantic schema generation error).
shim_name = "langgraph.checkpoint.memory"
if shim_name not in sys.modules:
    shim = types.ModuleType(shim_name)
    # Minimal placeholder class used by langgraph.checkpoint.__init__ import
    class MemorySaver:
        def __init__(self, *args, **kwargs):
            pass
    shim.MemorySaver = MemorySaver
    # Insert shim into sys.modules so `import langgraph.checkpoint.memory` finds this module
    sys.modules[shim_name] = shim
# --- END PATCH ---
# Load environment variables from .env file
load_dotenv()

# Add the current directory to the Python path to handle imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Provide compatibility shim for `langchain_core.pydantic_v1` (some packages still import it).
# This maps the module to `pydantic.v1` if present, otherwise provides minimal placeholders.
try:
    import importlib
    importlib.import_module("langchain_core.pydantic_v1")
except Exception:
    try:
        import pydantic.v1 as _pyd_v1
    except Exception:
        _pyd_v1 = None

    shim_name = "langchain_core.pydantic_v1"
    if shim_name not in sys.modules:
        shim = types.ModuleType(shim_name)
        if _pyd_v1 is not None:
            for sym in ("BaseModel", "Field", "root_validator", "validator", "ValidationError"):
                if hasattr(_pyd_v1, sym):
                    setattr(shim, sym, getattr(_pyd_v1, sym))
        else:
            class BaseModel:  # minimal placeholder
                pass

            def Field(*args, **kwargs):
                return None

            def root_validator(*args, **kwargs):
                def _wrap(f):
                    return f
                return _wrap

            setattr(shim, "BaseModel", BaseModel)
            setattr(shim, "Field", Field)
            setattr(shim, "root_validator", root_validator)

        sys.modules[shim_name] = shim

# Import the financial report generator
from tools.Tool_1_Financial_Report_Generator import generate_financial_report

# Import the personalized financial advisor
from tools.personalized_financial_advisor import (
    process_financial_document,
    get_financial_advice,
    update_user_preferences,
    # get_model_evaluation
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure the reports directory exists
os.makedirs("reports", exist_ok=True)
os.makedirs("reports/charts", exist_ok=True)

@app.route('/')
def root():
    return jsonify({"message": "Finance RAG Application Server is running"})

@app.route('/generate-organization-financial-report', methods=['POST'])
def generate_organization_financial_report_api():
    """Generate an Organizational financial report for a stock symbol."""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        data_type = data.get('data_type', 'organization')
        
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
        
        # Generate unique ID for this report
        report_id = str(uuid.uuid4())[:8]

        report_path = generate_financial_report(
            data_source=symbol,
            data_type=data_type,
            report_id=report_id
        )

        chart_files = {}
        for file in os.listdir("reports/charts"):
            if file.startswith(report_id) and file.endswith(".png"):
                chart_type = "price_chart" if "price" in file else "other_chart"
                chart_files[chart_type] = file

        return jsonify({
            "success": True, 
            "report_path": report_path,
            "charts": chart_files
        })
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/generate-user-financial-report', methods=['POST'])
def generate_user_financial_report_api():
    """Generate a financial report based on the user's provided data. (data -> xls,csv,json)"""
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
            
            # Generate unique ID for this report
            report_id = str(uuid.uuid4())[:8]

            # Generate the report from the file
            report_path = generate_financial_report(
                data_source=temp_path,
                data_type=data_type,
                report_id=report_id
            )

            # Find the charts generated for this report
            chart_files = {}
            for file in os.listdir("reports/charts"):
                if file.startswith(report_id) and file.endswith(".png"):
                    # Better chart type identification
                    if "revenue" in file or "expenses" in file:
                        chart_files["revenue_chart"] = file
                    elif "price" in file or "stock" in file:
                        chart_files["price_chart"] = file
                    else:
                        chart_files["other_chart"] = file
            
            # Clean up the temporary file
            os.unlink(temp_path)
            
            return jsonify({
                "success": True, 
                "report_path": report_path,
                "filename": os.path.basename(report_path),
                "charts": chart_files
            })
            
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

@app.route('/view-reports', methods=['GET'])
def view_reports():
    """Get all reports for a user."""
    try:
        user_id = request.args.get('userId')
        
        # List all PDF files in the reports directory
        reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
        reports = []
        
        if os.path.exists(reports_dir):
            for file in os.listdir(reports_dir):
                if file.endswith('.pdf'):
                    # Get report_id from filename prefix if possible
                    report_id = None
                    if '_' in file:
                        report_id = file.split('_')[0]
                    
                    # Find associated chart files
                    chart_files = {}
                    if report_id:
                        charts_dir = os.path.join(reports_dir, 'charts')
                        if os.path.exists(charts_dir):
                            for chart in os.listdir(charts_dir):
                                if chart.startswith(report_id) and chart.endswith('.png'):
                                    if 'stock' in chart or 'price' in chart:
                                        chart_files['stock_chart'] = chart
                                    elif 'revenue' in chart or 'expense' in chart:
                                        chart_files['revenue_chart'] = chart
                    
                    report_type = 'stock' if 'organization' in file or 'stock' in file else 'user'
                    
                    # Add report info to list
                    reports.append({
                        "filename": file,
                        "reportType": report_type,
                        "chartFiles": chart_files,
                        "created": os.path.getctime(os.path.join(reports_dir, file))
                    })
        
        # Sort by creation date, newest first
        reports.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify({
            "reports": reports,
            "success": True
        })
    except Exception as e:
        return jsonify({"error": f"Error fetching reports: {str(e)}"}), 500

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
        # Print full traceback to server logs for easier debugging during development
        import traceback
        traceback.print_exc()
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

# @app.route('/get-model-evaluation', methods=['POST'])
# def model_evaluation_api():
#     try:
#         data = request.get_json()
#         user_id = data.get('user_id')
#         evaluation_data = data.get('evaluation_data')
        
#         if not user_id or not evaluation_data:
#             return jsonify({"error": "User ID and evaluation data are required"}), 400
        
#         evaluation_result = get_model_evaluation(user_id, evaluation_data)
#         return jsonify({"evaluation": evaluation_result})
#     except Exception as e:
#         return jsonify({"error": f"Error evaluating model: {str(e)}"}), 500

if __name__ == "__main__":
    # Production configuration
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_ENV") != "production"
    
    # Update CORS for production
    app.config['CORS_ORIGINS'] = [
        "https://your-frontend.vercel.app",
        "http://localhost:4000"
    ]
    
    app.run(host="0.0.0.0", port=port, debug=debug_mode)


