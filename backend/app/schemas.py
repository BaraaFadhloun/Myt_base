from typing import Literal, List

from pydantic import BaseModel, Field


class HistoryItem(BaseModel):
    role: Literal["user", "assistant"] = Field(description="Who produced the message")
    content: str = Field(description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Latest user message")
    history: List[HistoryItem] = Field(default_factory=list, description="Conversation history including prior turns")


class ChatResponse(BaseModel):
    response: str = Field(description="Assistant response text")
