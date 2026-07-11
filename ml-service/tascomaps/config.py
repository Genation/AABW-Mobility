"""Runtime configuration and dataset-path resolution.

Everything is overridable via environment variables so the same code runs in
local dev, CI, and the live demo. The LLM layer (OpenRouter) is fully optional:
if no key is present the system degrades gracefully to the deterministic +
local-embedding core.
"""
from __future__ import annotations

import os
from pathlib import Path


def _find_datasets_dir() -> Path:
    """Walk upward from this file looking for the challenge dataset folder."""
    env = os.getenv("TASCO_DATA_DIR")
    if env:
        return Path(env).expanduser().resolve()
    here = Path(__file__).resolve()
    for parent in [here, *here.parents]:
        cand = parent / "datasets" / "ai-maps-challenge-package"
        if cand.is_dir():
            return cand
    # Fallback: repo layout used during development.
    return (here.parents[2] / "datasets" / "ai-maps-challenge-package").resolve()


DATASETS_DIR = _find_datasets_dir()

TRACK1_XLSX = DATASETS_DIR / "Track 1: AI Search Understanding for Maps" / \
    "ai_maps_track1_dataset_participants_v2.xlsx"
TRACK2_XLSX = DATASETS_DIR / "Track 2: AI Semantic Search & Ranking" / \
    "ai_maps_track2_dataset_participants.xlsx"
TRACK4_XLSX = DATASETS_DIR / "Track 4: AI-Powered Autocomplete & Query Suggestions" / \
    "ai_maps_track4_dataset_participants.xlsx"
TRACK6_XLSX = Path(os.getenv(
    "TASCO_TRACK6_XLSX",
    str(DATASETS_DIR / "Track 6: AI-Powered Restaurant & Menu Intelligence" /
        "ai_maps_track6_dataset_participants.xlsm"),
)).expanduser().resolve()

# --- Embedding model (local, offline after first download) ---------------
EMBED_MODEL = os.getenv("TASCO_EMBED_MODEL", "intfloat/multilingual-e5-small")
# Set TASCO_DISABLE_EMBED=1 to force the TF-IDF fallback (no torch needed).
DISABLE_EMBED = os.getenv("TASCO_DISABLE_EMBED", "").lower() in {"1", "true", "yes"}

# --- Track 4 autocomplete service (teammate's official backend) ----------
# When set, /autocomplete proxies to this Deno service; otherwise our local
# engine is used as a fallback. e.g. http://localhost:8000
TRACK4_URL = os.getenv("TRACK4_URL", "").rstrip("/")
TRACK4_TIMEOUT = float(os.getenv("TRACK4_TIMEOUT", "0.75"))
TRACK4_BREAKER_SECONDS = float(os.getenv("TRACK4_BREAKER_SECONDS", "5.0"))
TRACK4_CACHE_SECONDS = float(os.getenv("TRACK4_CACHE_SECONDS", "2.0"))
# local fallback autocomplete engine: "trie" (fast, default) or "scan"
AC_ENGINE = os.getenv("TASCO_AC_ENGINE", "trie").lower()

# --- OpenRouter LLM boost (optional) -------------------------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
# The LLM layer is used only when explicitly enabled AND a key exists.
LLM_ENABLED = bool(OPENROUTER_API_KEY) and os.getenv(
    "TASCO_LLM", "auto").lower() not in {"0", "off", "false", "no"}


def config_summary() -> dict:
    return {
        "datasets_dir": str(DATASETS_DIR),
        "datasets_found": DATASETS_DIR.is_dir(),
        "track6_menu_found": TRACK6_XLSX.is_file(),
        "embed_model": None if DISABLE_EMBED else EMBED_MODEL,
        "embed_enabled": not DISABLE_EMBED,
        "llm_enabled": LLM_ENABLED,
        "llm_model": OPENROUTER_MODEL if LLM_ENABLED else None,
        "track4_service": TRACK4_URL or None,
        "track4_timeout_seconds": TRACK4_TIMEOUT,
        "track4_breaker_seconds": TRACK4_BREAKER_SECONDS,
    }
