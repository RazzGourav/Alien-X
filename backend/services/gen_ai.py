import vertexai
from vertexai.generative_models import GenerativeModel, Part

# --- CONFIGURATION ---
# (You already have these in doc_ai.py, but good to have here too)
PROJECT_ID = "lumenai-478205"
LOCATION = "us-central1" # Use a region that supports the model

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

# Load the model
model = GenerativeModel("gemini-2.0-flash-lite-001")


def get_ai_response(data: str, question: str):
    """
    Constructs a prompt and gets a natural language answer from Vertex AI.
    """
    # This prompt is the core of your "Agentic" system [cite: 215]
    prompt = f"""
    You are "LUMEN-Agent", a helpful financial coach.
    A user has asked a question about their finances.
    
    Use the following structured data (from their BigQuery database) to answer their question.
    Do not mention the data or that you are looking at data. Just answer the question naturally.

    DATA:
    {data}

    USER'S QUESTION:
    {question}

    YOUR ANSWER:
    """

    try:
        response = model.generate_content([prompt])
        return response.text

    except Exception as e:
        print(f"Error generating content: {e}")
        return "I'm sorry, I'm having trouble analyzing that right now."
