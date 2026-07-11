#!/usr/bin/env bash
# Tasco Maps AI — convenience launcher.
#
#   ./run.sh serve      start the API + web demo at http://127.0.0.1:8000
#   ./run.sh generalize run the corpus-derived P6/P7 quality gate (no public labels)
#   ./run.sh quality    run the semantics-first end-to-end experience gate
#   ./run.sh eval       run the public compatibility evaluation (deterministic)
#   ./run.sh eval-llm   run the evaluation with the OpenRouter LLM boost
#   ./run.sh full-eval  run public, robustness, ablation, and latency tests for P6/P7/P9
#   ./run.sh samples    regenerate artifacts/sample_outputs.{md,json}
#   ./run.sh install    install Python dependencies
#
# Optional environment variables:
#   TRACK4_URL           teammate's Track 4 autocomplete service (e.g. http://localhost:8000)
#   PORT                 port for this API (default 8000; use 8100 if Track 4 is on 8000)
#   OPENROUTER_API_KEY   enable the hybrid LLM boost
#   OPENROUTER_MODEL     default: openai/gpt-4o-mini
#   TASCO_DATA_DIR       path to datasets/ai-maps-challenge-package
#   TASCO_DISABLE_EMBED  set to 1 to force the TF-IDF fallback (no torch)
set -euo pipefail
cd "$(dirname "$0")"
if [[ -n "${PYTHON:-}" ]]; then
  PYTHON_BIN="$PYTHON"
elif [[ -x .venv/bin/python ]]; then
  PYTHON_BIN=.venv/bin/python
else
  PYTHON_BIN=python3
fi
CMD="${1:-serve}"
case "$CMD" in
  install) "$PYTHON_BIN" -m pip install -r requirements.txt ;;
  serve)   "$PYTHON_BIN" -m uvicorn tascomaps.api.main:app --host 0.0.0.0 --port "${PORT:-8000}" ;;
  generalize) shift; "$PYTHON_BIN" -m scripts.generalization_gate "$@" ;;
  quality) shift; "$PYTHON_BIN" -m scripts.experience_quality "$@" ;;
  eval)    "$PYTHON_BIN" -m eval.evaluate ;;
  eval-llm) "$PYTHON_BIN" -m eval.evaluate --llm ;;
  full-eval) "$PYTHON_BIN" -m scripts.full_suite --all ;;
  samples) "$PYTHON_BIN" -m scripts.samples ;;
  *) echo "unknown command: $CMD"; grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
