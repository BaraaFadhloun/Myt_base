from functools import lru_cache
from typing import Iterable, List

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from .schemas import ChatRequest, ChatResponse, HistoryItem

BASE_DIR = Path(__file__).resolve().parent.parent

# First load repository-level .env (if present), then fall back to defaults.
load_dotenv(BASE_DIR / ".env", override=False)
load_dotenv(override=False)

app = FastAPI(title="Python Course Tutor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


SYSTEM_PROMPT = (
    "You are PyMentor, a friendly and patient Python tutor designed to help learners with ADHD or dyslexia. "
    "You respond using short, clear sentences that appear one at a time, making it easier for users to focus. "
    "Keep your tone natural and supportive, like a friendly peer explaining things simply. "
    "Use plain language and concrete examples when needed. "
    "When showing Python examples, always wrap them inside triple backticks with 'python' at the start, like this: ```python code here ``` "
    "Always leave an empty line between paragraphs to improve visual clarity. "
    "Do not use bullet points or dashes ('-'). Instead, explain ideas sentence by sentence in a natural flow. "
    "Avoid decorative characters, but light emojis are okay if they help convey tone or encouragement. "
    "Since the user is pausing a video to ask you something, end naturally without adding motivational lines or summaries."
    "these are the languages that u can respond with : arabic , eng , fr, jp"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{user_message}"),
    ]
)


@lru_cache(maxsize=1)
def get_chain():
    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.6)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to initialise language model: {exc}") from exc

    parser = StrOutputParser()
    return prompt | llm | parser


def convert_history(items: List[HistoryItem]) -> Iterable[BaseMessage]:
    converted: List[BaseMessage] = []
    for item in items:
        content = item.content.strip()
        if not content:
            continue
        if item.role == "assistant":
            converted.append(AIMessage(content=content))
        else:
            converted.append(HumanMessage(content=content))
    return converted


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message must not be empty")

    history_messages = list(convert_history(request.history))

    try:
        chain = get_chain()
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    try:
        response_text = await chain.ainvoke(
            {
                "history": history_messages,
                "user_message": message,
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"LLM invocation failed: {exc}") from exc

    cleaned = response_text.strip()
    if cleaned and cleaned[-1] not in ".!?":
        cleaned = f"{cleaned}."

    return ChatResponse(response=cleaned)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
