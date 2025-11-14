from google.cloud import documentai_v1 as documentai
from google.api_core.client_options import ClientOptions

# HARDCODE THESE FOR HACKATHON SPEED (Or use .env)
PROJECT_ID = "lumenai-478205"
LOCATION = "us" # or eu
PROCESSOR_ID = "30fec0bc853f0e63" # Create this in GCP Console -> Document AI

def process_document(file_content: bytes, mime_type: str):
    opts = ClientOptions(api_endpoint=f"{LOCATION}-documentai.googleapis.com")
    client = documentai.DocumentProcessorServiceClient(client_options=opts)
    
    name = client.processor_path(PROJECT_ID, LOCATION, PROCESSOR_ID)
    
    raw_document = documentai.RawDocument(content=file_content, mime_type=mime_type)
    request = documentai.ProcessRequest(name=name, raw_document=raw_document)
    
    result = client.process_document(request=request)
    document = result.document

    # Extract basic entities (Simplified for MVP)
    data = {
        "total_amount": 0.0,
        "currency": "USD",
        "merchant_name": "Unknown",
        "date": None
    }
    
    # Iterate through entities found by the Receipt Processor
    for entity in document.entities:
        if entity.type_ == "total_amount":
            data["total_amount"] = entity.normalized_value.text  # Standardized value
        if entity.type_ == "supplier_name":
            data["merchant_name"] = entity.mention_text
        if entity.type_ == "receipt_date":
            data["date"] = entity.normalized_value.text

    return data
