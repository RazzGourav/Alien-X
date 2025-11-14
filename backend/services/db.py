from google.cloud import firestore
from google.cloud import bigquery
import datetime

# Initialize Clients
fs_client = firestore.Client()
bq_client = bigquery.Client()

DATASET_ID = "lumenai-478205.lumen_financial_data"
TABLE_ID = "lumenai-478205.lumen_financial_data.expenses"

def save_transaction(data: dict, user_id: str):
    # 1. Add Metadata
    data["user_id"] = user_id
    data["timestamp"] = datetime.datetime.now().isoformat()
    
    # 2. Save to Firestore (Real-time access for UI)
    doc_ref = fs_client.collection("users").document(user_id).collection("transactions").document()
    doc_ref.set(data)
    
    # 3. Save to BigQuery (Analytical brain)
    # Note: Ensure BQ dataset/table exists in GCP first!
    rows_to_insert = [{
        "user_id": user_id,
        "merchant": data["merchant_name"],
        "amount": float(data["total_amount"]),
        "date": data["date"],
        "category": "Uncategorized" # Can add classification logic later
    }]
    
    errors = bq_client.insert_rows_json(f"{DATASET_ID}.{TABLE_ID}", rows_to_insert)
    if errors:
        print(f"BigQuery Errors: {errors}")
        
    return doc_ref.id
