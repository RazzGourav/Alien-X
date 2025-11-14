from fastapi import FastAPI, UploadFile, File, HTTPException
from services.doc_ai import process_document
from services.db import save_transaction
# --- NEW IMPORTS ---
from services.ai_coach import get_conversational_answer, get_proactive_agent_report
from models.schemas import AIQuery, ReportRequest 
# ---------------------

app = FastAPI(title="LUMEN-Agent API")

@app.get("/")
def read_root():
    return {"status": "LUMEN-Agent Active"}

@app.post("/upload-receipt/")
async def upload_receipt(user_id: str, file: UploadFile = File(...)):
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
        raise HTTPException(status_code=500, detail=f"DocAI Error: {str(e)}")

    # 3. Store in DB
    try:
        txn_id = save_transaction(extracted_data, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")

    return {
        "status": "success",
        "transaction_id": txn_id,
        "data": extracted_data
    }

# --- NEW ENDPOINT 1: CONVERSATIONAL Q&A ---
@app.post("/ask-ai/")
async def ask_ai_agent(query: AIQuery):
    """
    Phase 3: The "Brain" (Generative AI Q&A)
    """
    try:
        answer = get_conversational_answer(query.user_id, query.question)
        return {"user_id": query.user_id, "answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW ENDPOINT 2: PROACTIVE AGENT REPORT ---
@app.post("/get-report/")
async def get_agent_report(request: ReportRequest):
    """
    Phase 4: The "Novelty" (Proactive Agent Report)
    """
    try:
        report = get_proactive_agent_report(request.user_id)
        return {"user_id": request.user_id, "report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn main:app --reload
