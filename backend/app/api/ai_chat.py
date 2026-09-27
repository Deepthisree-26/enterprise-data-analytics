from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.ai.chat import answer_question
from app.auth.security import get_current_user
from app.database import get_db

router = APIRouter()

class ChatRequest(BaseModel):
    question: str
    model: str = "llama3.2"

class ChatResponse(BaseModel):
    answer: str

@router.post("/ai-chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        user_role = getattr(current_user, "role", "Analyst") or "Analyst"
        answer = await answer_question(request.question, db, user_role, request.model)
    except Exception:
        from app.ai.chat import generate_bi_answer, get_database_summary
        summary = get_database_summary(db)
        answer = generate_bi_answer(request.question, summary, getattr(current_user, "role", "Analyst") or "Analyst")
    return ChatResponse(answer=answer)
