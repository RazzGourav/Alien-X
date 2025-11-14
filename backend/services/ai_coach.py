import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import bigquery
from google.oauth2 import service_account
import json
import os

# --- CONFIGURATION ---
PROJECT_ID = "lumenai-478205"  # <--- UPDATED
LOCATION = "us-central1" 
DATASET_ID = "lumen_financial_data"
TABLE_ID = "expenses"
KEY_PATH = "lumenai-478205-a6f308224f9f.json" # <--- ADDED

# Verify key exists
if not os.path.exists(KEY_PATH):
    raise FileNotFoundError(f"CRITICAL: Missing key file at {KEY_PATH}")

# Load Credentials
credentials = service_account.Credentials.from_service_account_file(KEY_PATH)

# Initialize clients with credentials
vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
bq_client = bigquery.Client(credentials=credentials, project=PROJECT_ID)

# Load the model
model = GenerativeModel(model_name="gemini-2.0-flash-lite-001")

def _get_user_data_from_bq(user_id: str) -> str:
    """Helper function to fetch user's transaction data from BigQuery."""
    
    # Construct Table ID safely
    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

    query = f"""
        SELECT merchant, amount, date, category
        FROM `{table_ref}`
        WHERE user_id = @user_id
        ORDER BY date DESC
        LIMIT 50 
    """
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    
    try:
        query_job = bq_client.query(query, job_config=job_config)
        results = query_job.result() 
        
        # Convert rows to a list of dicts
        rows = [dict(row) for row in results]
        
        if not rows:
            return "No spending data found for this user."
            
        return json.dumps(rows, default=str) # default=str handles Date objects
    except Exception as e:
        print(f"BigQuery Fetch Error: {e}")
        return "Error retrieving data."

def get_conversational_answer(user_id: str, question: str) -> str:
    spending_data_json = _get_user_data_from_bq(user_id)
    
    prompt = f"""
    You are 'LUMEN', a helpful and insightful financial coach.
    Based ONLY on the user's spending data provided below, answer their question.
    
    Data:
    {spending_data_json}
    
    User's Question: "{question}"
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        return "I'm having trouble thinking right now."

def get_proactive_agent_report(user_id: str) -> str:
    spending_data_json = _get_user_data_from_bq(user_id)
    
    if "No spending data" in spending_data_json:
        return "I can't generate a report yet. Please upload some receipts first!"

    prompt = f"""
    You are 'LUMEN', a proactive 'Budget Agent'.
    Analyze this spending history and generate a markdown report:
    1. Brief greeting.
    2. Top spending category.
    3. One actionable tip.
    
    Data:
    {spending_data_json}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        return "I'm having trouble generating your report."

def get_document_chat_answer(document_data: dict, question: str) -> str:
    """Answers a question based *only* on the provided document data."""
    
    # Convert the Python dict to a JSON string for the prompt
    data_str = json.dumps(document_data, indent=2)

    prompt = f"""
    You are a helpful assistant. A user has just uploaded a receipt and is 
    asking a question about it.
    
    Use *only* the following JSON data from that one receipt to answer the question.
    Do not use any other knowledge. If the answer isn't in the data, 
    say so.

    RECEIPT DATA:
    {data_str}

    USER'S QUESTION:
    {question}

    YOUR ANSWER:
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Vertex AI Error (Document Chat): {e}")
        return "I'm having trouble analyzing that document right now."