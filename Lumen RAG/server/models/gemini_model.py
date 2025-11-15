import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=GOOGLE_API_KEY
)
    
# class GeminiLLM:
#     """Class to implement LLM model for Gemini."""
#     def __init__(self, api_key):
#         self.api_key = GOOGLE_API_KEY
#         self.model = ChatGoogleGenerativeAI(
#             model="gemini-1.5-pro",
#             google_api_key=self.api_key
#         )
    
#     def __call__(self, prompt):
#         # Convert PromptValue to string if needed
#         if hasattr(prompt, 'to_string'):
#             prompt = prompt.to_string()
        
#         try:
#             print(f"Sending request to Gemini API...")
#             response = self.model.invoke(prompt)

#             # LangChain returns an AIMessage object, extract the content
#             if hasattr(response, 'content'):
#                 return response.content
#             else:
#                 # Handle case where response is already a string or other format
#                 return str(response)
        
#         except Exception as e:
#             print(f"Exception occurred: {e}")
#             return "Sorry, there was an error with the API request."
    