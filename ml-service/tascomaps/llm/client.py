"""Thin OpenRouter (OpenAI-compatible) client with graceful degradation.

If no key is configured or the call fails, callers fall back to the
deterministic engines — the whole system works offline without this module.
"""
from __future__ import annotations

import json
import re
from typing import Optional

from .. import config

_client = None
_warned = False


def is_available() -> bool:
    return bool(config.LLM_ENABLED)


def _get_client():
    global _client
    if _client is None:
        from openai import OpenAI
        _client = OpenAI(api_key=config.OPENROUTER_API_KEY,
                         base_url=config.OPENROUTER_BASE_URL, timeout=20.0)
    return _client


def _extract_json(text: str) -> Optional[dict]:
    try:
        return json.loads(text)
    except Exception:
        pass
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            return None
    return None


def chat_json(system: str, user: str, temperature: float = 0.0,
              max_tokens: int = 700) -> Optional[dict]:
    """Return a parsed JSON object from the model, or None on any failure."""
    global _warned
    if not is_available():
        return None
    try:
        client = _get_client()
        resp = client.chat.completions.create(
            model=config.OPENROUTER_MODEL,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
            temperature=temperature, max_tokens=max_tokens,
            response_format={"type": "json_object"},
            extra_headers={"X-Title": "Tasco Maps AI"},
        )
        return _extract_json(resp.choices[0].message.content or "")
    except Exception as e:  # pragma: no cover - network dependent
        if not _warned:
            print(f"[llm] OpenRouter call failed ({e}); using deterministic core")
            _warned = True
        return None
