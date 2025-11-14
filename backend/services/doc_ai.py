from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions
from google.oauth2 import service_account
import os

# --- CONFIGURATION ---
PROJECT_ID = "lumenai-478205"
LOCATION = "us" 
PROCESSOR_ID = "30fec0bc853f0e63"
KEY_PATH = "lumenai-478205-a6f308224f9f.json"

def process_document(file_content: bytes, mime_type: str):
    # Load Credentials
    credentials = service_account.Credentials.from_service_account_file(KEY_PATH)

    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    
    # Pass credentials to the client
    client = documentai.DocumentProcessorServiceClient(
        client_options=opts,
        credentials=credentials
    )
    
    name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
    
    raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
    request = documentai.ProcessRequest(name=name, raw_document=raw_document)
    
    result = client.process_document(request=request)
    document = result.document

    # Extract entities
    data = {
        "total_amount": 0.0,
        "currency": "USD",
        "merchant_name": "Unknown",
        "date": None
    }
    
    for entity in document.entities:
        # Normalize text values to avoid extraction errors
        val = entity.normalized_value.text if entity.normalized_value else entity.mention_text

        if entity.type_ == "total_amount":
            data["total_amount"] = val
        if entity.type_ == "supplier_name":
            data["merchant_name"] = entity.mention_text
        if entity.type_ == "receipt_date":
            data["date"] = val

    return data