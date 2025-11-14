import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import bigquery
import json

# HARDCODE THESE FOR HACKATHON
PROJECT_ID = "your-gcp-project-id"
LOCATION = "us-central1" # Or your region
DATASET_ID = "lumen_financial_data"
TABLE_ID = "expenses"

# Initialize clients
vertexai.init(project=PROJECT_ID, location=LOCATION)
bq_client = bigquery.Client()

# Load the model
# Using Flash for speed, as planned for the hackathon
model = GenerativeModel(model_name="gemini-1.5-flash-001") 

def _get_user_data_from_bq(user_id: str) -> str:
    """Helper function to fetch user's transaction data from BigQuery."""
    
    query = f"""
        SELECT merchant, amount, date, category
        FROM {PROJECT_ID}.{DATASET_ID}.{TABLE_ID}
        WHERE user_id = @user_id
        ORDER BY date DESC
        LIMIT 50 
    """ # Limit to 50 to avoid huge prompts
    
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
        ]
    )
    
    query_job = bq_client.query(query, job_config=job_config)
    results = query_job.result() # Wait for the job to complete
    
    # Convert rows to a list of dicts
    rows = [dict(row) for row in results]
    
    if not rows:
        return "No spending data found for this user."
        
    # Convert to JSON string for the prompt
    return json.dumps(rows)

def get_conversational_answer(user_id: str, question: str) -> str:
    """
    Phase 3: The "Brain" (Generative AI Q&A)
    Takes a user question and their data, then returns a natural language answer.
    """
    
    # 1. Get the user's financial data
    spending_data_json = _get_user_data_from_bq(user_id)
    
    # 2. Construct the prompt for the Gemini model
    prompt = f"""
    You are 'LUMEN', a helpful and insightful financial coach.
    You are speaking directly to your user.
    
    Based ONLY on the user's spending data provided below, answer their question.
    If the data is not present, just say "I don't have that information in your records."
    
    Here is the user's spending data (in JSON format):
    {spending_data_json}
    
    User's Question:
    "{question}"
    
    Your Answer:
    """
    
    # 3. Call Vertex AI
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        return "I'm having trouble thinking right now. Please try again in a moment."

def get_proactive_agent_report(user_id: str) -> str:
    """
    Phase 4: The "Novelty" (Proactive Agent)
    Generates a financial health report based on all user data.
    """
    
    # 1. Get the user's financial data
    spending_data_json = _get_user_data_from_bq(user_id)
    
    if spending_data_json == "No spending data found for this user.":
        return "I can't generate a report yet. Please upload some receipts first!"

    # 2. Construct the "Agent Persona" prompt
    prompt = f"""
    You are 'LUMEN', a proactive 'Budget Agent' for a financial wellness app.
    Your tone is encouraging, clear, and insightful.
    
    Analyze the user's complete spending history provided below (in JSON format).
    Generate a "Monthly Financial Health Report" for the user.
    
    Your report MUST:
    1.  Start with a brief, positive greeting.
    2.  Identify their top spending category this month.
    3.  Provide one simple, actionable insight or tip based on their spending.
    4.  Be formatted in simple markdown.
    
    Here is the user's spending data:
    {spending_data_json}
    
    Your Report:
    """
    
    # 3. Call Vertex AI
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        return "I'm having trouble generating your report. Please try again in a moment."
