"""Client for the teammate's official Track 4 autocomplete service.

The team pipeline is: Track 4 (Trie autocomplete) -> our P6 /understand ->
our P7 /search. This module calls the Deno service's

    GET {TRACK4_URL}/api/v1/track-4/suggest?q=&limit=&lat=&lng=

and normalizes its response to our AutocompleteResponse shape. Stdlib-only
(urllib) with a short timeout; callers fall back to the local engine on any
error, so the demo works even when the service is not running.
"""
from __future__ import annotations

import json
import math
import threading
import time
import urllib.parse
import urllib.request
from typing import Optional

from .. import config


_LOCK = threading.Lock()
_OPEN_UNTIL = 0.0
_FAILURES = 0
_CACHE: dict[tuple, tuple[float, dict]] = {}


def _reset_state_for_tests() -> None:
    """Clear process-local resilience state (used by isolated tests)."""
    global _OPEN_UNTIL, _FAILURES
    with _LOCK:
        _OPEN_UNTIL = 0.0
        _FAILURES = 0
        _CACHE.clear()


def _cached(key, now: float) -> Optional[dict]:
    with _LOCK:
        value = _CACHE.get(key)
        if value and value[0] >= now:
            return value[1]
        if value:
            _CACHE.pop(key, None)
    return None


def _record_failure(now: float) -> None:
    global _OPEN_UNTIL, _FAILURES
    with _LOCK:
        _FAILURES += 1
        delay = min(30.0, max(0.0, config.TRACK4_BREAKER_SECONDS)
                    * (2 ** min(3, _FAILURES - 1)))
        _OPEN_UNTIL = max(_OPEN_UNTIL, now + delay)


def _record_success(key, value: dict, now: float) -> None:
    global _OPEN_UNTIL, _FAILURES
    with _LOCK:
        _FAILURES = 0
        _OPEN_UNTIL = 0.0
        if config.TRACK4_CACHE_SECONDS > 0:
            if len(_CACHE) >= 256:
                oldest = min(_CACHE, key=lambda item: _CACHE[item][0])
                _CACHE.pop(oldest, None)
            _CACHE[key] = (now + config.TRACK4_CACHE_SECONDS, value)


def is_configured() -> bool:
    return bool(config.TRACK4_URL)


def suggest(prefix: str, limit: int = 6, lat: Optional[float] = None,
            lng: Optional[float] = None) -> Optional[dict]:
    """Call the Track 4 service. Returns our AutocompleteResponse dict or None."""
    if not config.TRACK4_URL:
        return None
    now = time.monotonic()
    key = (prefix, int(limit), lat, lng)
    cached = _cached(key, now)
    if cached is not None:
        return cached
    with _LOCK:
        if now < _OPEN_UNTIL:
            return None
    params = {"q": prefix, "limit": limit}
    if lat is not None:
        params["lat"] = lat
    if lng is not None:
        params["lng"] = lng
    url = f"{config.TRACK4_URL}/api/v1/track-4/suggest?" + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=config.TRACK4_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        _record_failure(time.monotonic())
        return None
    raw = data.get("suggestions") if isinstance(data, dict) else None
    if not isinstance(raw, list):
        _record_failure(time.monotonic())
        return None
    suggestions = []
    for s in raw:
        if not isinstance(s, dict):
            continue
        display = s.get("display") or s.get("text") or ""
        if not display:
            continue
        try:
            score = float(s.get("score", 0) or 0)
        except (TypeError, ValueError):
            score = 0.0
        suggestions.append({
            "text": display,                       # accented, user-facing
            "display": display,
            "raw": s.get("text", ""),              # accent-less form
            "type": s.get("type", "Category Search"),
            "score": max(0.0, min(1.0, score)) if math.isfinite(score) else 0.0,
            "source": s.get("source") or data.get("source") or "track-4",
        })
    result = {
        "prefix": prefix,
        "suggestion_type": suggestions[0]["type"] if suggestions else None,
        "suggestions": suggestions,
        "source": "track-4-service",
        "latencyMs": data.get("latencyMs"),
    }
    _record_success(key, result, time.monotonic())
    return result
