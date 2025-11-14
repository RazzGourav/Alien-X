from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware  # <--- ADDED THIS
from services.doc_ai import process_document
from services.db import save_transaction
from services.db import (
    save_transaction, 
    save_financial_settings, 
    get_financial_settings,
    get_analysis_data,
    calculate_budget_sniper_reward,
    redeem_points  # <--- 1. ADD THIS IMPORT
) # <-- 1. ADD NEW IMPORTS
from services.ai_coach import (
    get_conversational_answer, 
    get_proactive_agent_report, 
    get_document_chat_answer,
    _get_user_data_from_bq
)
from models.schemas import (
    AIQuery, 
    ReportRequest, 
    AskDocumentRequest,
    FinancialSettings  # <-- ADDED
)

app = FastAPI(title="LUMEN-Agent API")

# --- MIDDLEWARE (Must be before endpoints) ---
origins = [
    "http://localhost:3000", 
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "LUMEN-Agent Active"}

@app.post("/upload-receipt/")
async def upload_receipt(user_id: str = Form(...), file: UploadFile = File(...)):
    """
    Phase 2 Core: Ingest -> Process -> Store
    """
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # 1. Read file
    content = await file.read()

    # 2. Process with Document AI
    try:
        extracted_data = process_document(content, file.content_type)
    except Exception as e:
        print(f"DocAI Error: {e}") # Debugging
        raise HTTPException(status_code=500, detail=f"DocAI Error: {str(e)}")

    # 3. Store in DB
    try:
        txn_id = save_transaction(extracted_data, user_id)
    except Exception as e:
        print(f"DB Error: {e}") # Debugging
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    return {
        "status": "success",
        "transaction_id": txn_id,
        "data": extracted_data
    }

# --- ENDPOINT 1: CONVERSATIONAL Q&A ---
@app.post("/ask-ai/")
async def ask_ai_agent(query: AIQuery):
    try:
        answer = get_conversational_answer(query.user_id, query.question)
        return {"user_id": query.user_id, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 2: PROACTIVE AGENT REPORT ---
@app.post("/get-report/")
async def get_agent_report(request: ReportRequest):
    try:
        report = get_proactive_agent_report(request.user_id)
        return {"user_id": request.user_id, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask-document")
async def ask_document(request: AskDocumentRequest):
    """
    This endpoint handles chat about a *single*, just-uploaded document.
    """
    try:
        # Call the new, specific AI function
        ai_answer = get_document_chat_answer(
            document_data=request.document_data, 
            question=request.question
        )
        
        return {"answer": ai_answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/settings")
async def post_settings(settings: FinancialSettings):
    try:
        result = save_financial_settings(
            user_id=settings.user_id,
            salary=settings.salary,
            limit=settings.limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 5: GET FINANCIAL SETTINGS ---
@app.get("/api/settings/{user_id}")
async def get_settings(user_id: str):
    try:
        settings = get_financial_settings(user_id)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 6: GET ALL EXPENSES ---
@app.get("/api/expenses/{user_id}")
async def get_expenses(user_id: str):
    """Gets all expenses for a user from BigQuery."""
    try:
        # We re-use the exact function your AI coach uses
        expenses_json = _get_user_data_from_bq(user_id)
        # The function returns a JSON string, so we parse it back to an object
        import json
        return json.loads(expenses_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/api/analysis/{user_id}")
async def get_analysis(user_id: str):
    try:
        data = get_analysis_data(user_id)
        return data
    except Exception as e:
        print(f"Analysis Data Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rewards/calculate-sniper/{user_id}")
async def trigger_sniper_reward(user_id: str):
    try:
        result = calculate_budget_sniper_reward(user_id)
        return result
    except Exception as e:
        print(f"Sniper Reward Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rewards/redeem/{user_id}")
async def trigger_redeem_points(user_id: str):
    try:
        result = redeem_points(user_id)
        return result
    except Exception as e:
        print(f"Redeem Endpoint Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))