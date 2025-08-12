from __future__ import annotations

import difflib
import json
from typing import Any, Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["chat"])


async def _send(ws: WebSocket, payload: Dict[str, Any]) -> None:
    await ws.send_text(json.dumps(payload))


@router.websocket("/chat")
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
                            "text": (
                                "Ask something like: 'Why is this function complex?'"
                            ),
                        },
                    )
                    continue
                reply = (
                    "Hotspots are ranked by complexity and degree (see /api/v1/graph). "
                    "Consider simplifying high-score nodes or breaking long functions."
                )
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
