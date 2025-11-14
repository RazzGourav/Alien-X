from pydantic import BaseModel

class AIQuery(BaseModel):
    user_id: str
    question: str

class ReportRequest(BaseModel):
    user_id: str
