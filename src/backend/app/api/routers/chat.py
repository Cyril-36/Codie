from __future__ import annotations

import difflib
import json
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ...core.security import get_current_user

router = APIRouter(tags=["chat"])

# Knowledge base for local responses (no API key needed)
_KNOWLEDGE = {
    "complexity": (
        "Code complexity is measured using cyclomatic complexity. "
        "High complexity (>10) suggests the function has too many branches. "
        "Consider extracting helper functions or using early returns to simplify."
    ),
    "refactor": (
        "Common refactoring strategies: extract method, rename variable, "
        "reduce nesting, replace conditional with polymorphism, "
        "and introduce parameter objects for functions with many arguments."
    ),
    "test": (
        "Good tests follow the AAA pattern: Arrange, Act, Assert. "
        "Aim for one assertion per test, use descriptive names, "
        "and test edge cases like empty inputs, None values, and boundary conditions."
    ),
    "security": (
        "Common security issues: hardcoded secrets, SQL injection via string formatting, "
        "command injection through subprocess, insecure deserialization, "
        "and missing input validation. Use parameterized queries and avoid eval()."
    ),
    "performance": (
        "Python performance tips: use generators for large datasets, "
        "avoid nested loops when possible, leverage list comprehensions, "
        "use collections.Counter instead of manual counting, "
        "and profile before optimizing with cProfile or line_profiler."
    ),
    "style": (
        "Follow PEP 8 for Python: 4-space indentation, snake_case for functions/variables, "
        "CamelCase for classes, max 79 chars per line (or 99 with team agreement), "
        "and use type hints for function signatures."
    ),
    "graph": (
        "Hotspots are ranked by complexity and degree (see /api/v1/graph). "
        "Consider simplifying high-score nodes or breaking long functions."
    ),
}


def _find_response(text: str) -> str:
    """Find the best matching knowledge response for a query."""
    text_lower = text.lower()
    for keyword, response in _KNOWLEDGE.items():
        if keyword in text_lower:
            return response

    return (
        "I can help with code complexity, refactoring, testing, security, "
        "performance, and style questions. Try asking about one of these topics, "
        "or use the analysis endpoints for detailed code review."
    )


class ChatRequest(BaseModel):
    message: str
    context: str | None = None


class ChatResponse(BaseModel):
    response: str
    timestamp: str


@router.post("/chat")
async def chat(req: ChatRequest, _user=Depends(get_current_user)) -> ChatResponse:
    """REST chat endpoint with local knowledge responses."""
    reply = _find_response(req.message)
    return ChatResponse(
        response=reply,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


# WebSocket chat (kept for backward compatibility)
_ws_router = APIRouter(prefix="/ws", tags=["chat"])


async def _send(ws: WebSocket, payload: Dict[str, Any]) -> None:
    await ws.send_text(json.dumps(payload))


@_ws_router.websocket("/chat")
async def chat_socket(ws: WebSocket):
    await ws.accept()
    try:
        await _send(
            ws,
            {
                "type": "hello",
                "text": "Codie chat connected. Send {type:'ask'|'diff', ...}.",
            },
        )
        while True:
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                await _send(ws, {"type": "error", "text": "invalid JSON"})
                continue

            mtype = msg.get("type")
            if mtype == "ask":
                text = str(msg.get("text", "")).strip()
                if not text:
                    await _send(
                        ws,
                        {
                            "type": "reply",
                            "text": "Ask something like: 'Why is this function complex?'",
                        },
                    )
                    continue
                reply = _find_response(text)
                await _send(ws, {"type": "reply", "text": reply})
            elif mtype == "diff":
                file = str(msg.get("file", "file"))
                before = str(msg.get("before", ""))
                after = str(msg.get("after", ""))
                udiff = "\n".join(
                    difflib.unified_diff(
                        before.splitlines(),
                        after.splitlines(),
                        fromfile=f"a/{file}",
                        tofile=f"b/{file}",
                        lineterm="",
                    )
                )
                await _send(ws, {"type": "diff", "unified": udiff})
            else:
                await _send(ws, {"type": "error", "text": "unknown type"})
    except WebSocketDisconnect:
        return


# Expose both routers
ws_router = _ws_router
