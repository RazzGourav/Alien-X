from pydantic import BaseModel
from typing import Dict, Any
class AIQuery(BaseModel):
    user_id: str
    question: str

class ReportRequest(BaseModel):
    user_id: str

class AskDocumentRequest(BaseModel):
    question: str
    document_data: Dict[str, Any] # This will be the receipt JSON
    user_id: str

class FinancialSettings(BaseModel):
    user_id: str
    salary: float
    limit: float