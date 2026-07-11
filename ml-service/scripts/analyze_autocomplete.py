"""Analyze the autocomplete engine against the Track 4 public gold set.

Produces per-case good/partial/failed classification + aggregates, written to
artifacts/autocomplete_analysis.json (consumed by the HTML report).

    python -m scripts.analyze_autocomplete
"""
from __future__ import annotations

import argparse
import json
import warnings
from collections import defaultdict
from pathlib import Path

warnings.filterwarnings("ignore")

from rapidfuzz import fuzz  # noqa: E402

from tascomaps.core.text import fold  # noqa: E402
from tascomaps.data.loader import load_eval, load_kb  # noqa: E402
from tascomaps.engines.autocomplete import AutocompleteEngine  # noqa: E402

TOP_K = 6


def _ids(s):
    return [x.strip() for x in str(s).split(";") if x.strip()]


def _match(expected: str, preds):
    """Return the best-matching predicted text (>=85 token_set_ratio) or None."""
    ef = fold(expected)
    best, best_s = None, 0
    for p in preds:
        s = 100 if fold(p) == ef else fuzz.token_set_ratio(ef, fold(p))
        if s > best_s:
            best, best_s = p, s
    return (best, best_s) if best_s >= 85 else (None, best_s)


def _make_suggester(source: str):
    """Return (name, suggest_fn) for the local fallback or the live Track 4 service."""
    if source == "service":
        from tascomaps.integrations import track4
        if not track4.is_configured():
            raise SystemExit("--source service needs TRACK4_URL set to the "
                             "teammate's Track 4 endpoint.")

        def _svc(prefix):
            out = track4.suggest(prefix, limit=TOP_K)
            return out or {"suggestion_type": None, "suggestions": []}
        return "track-4-service", _svc
    kb = load_kb()
    if source == "trie":
        from tascomaps.engines.trie import TrieAutocomplete
        eng = TrieAutocomplete(kb)
        return "trie", lambda p: eng.suggest(p, top_k=TOP_K)
    eng = AutocompleteEngine(kb)
    return "local-fallback", lambda p: eng.suggest(p, top_k=TOP_K)


def analyze(source: str = "local"):
    engine_name, suggest = _make_suggester(source)
    ev = load_eval("T4")
    cases = []
    for row in ev:
        prefix = row["input_prefix"]
        out = suggest(prefix)
        pred_objs = out.get("suggestions", [])
        preds = [s.get("display") or s["text"] for s in pred_objs]
        expected = _ids(row["expected_top_suggestions"])
        exp_status = []
        hits = 0
        for e in expected:
            m, sc = _match(e, preds)
            exp_status.append({"text": e, "matched": m is not None,
                               "match": m, "score": round(sc, 1)})
            hits += m is not None
        recall = hits / len(expected) if expected else 1.0
        type_match = out.get("suggestion_type") == row["expected_suggestion_type"]

        if recall >= 0.999 and type_match:
            bucket = "good"
        elif recall >= 0.999 or (recall > 0 and type_match):
            bucket = "partial"
        elif recall > 0:
            bucket = "partial"
        else:
            bucket = "failed"

        if not preds:
            reason = "empty result"
        elif recall == 0:
            reason = "wrong suggestions"
        elif recall < 0.999 and not type_match:
            reason = "partial + type mismatch"
        elif recall < 0.999:
            reason = "partial recall"
        elif not type_match:
            reason = "type mismatch"
        else:
            reason = "ok"

        cases.append({
            "case_id": row["case_id"], "prefix": prefix,
            "difficulty": row["difficulty"],
            "expected_type": row["expected_suggestion_type"],
            "predicted_type": out.get("suggestion_type"),
            "type_match": type_match, "recall": round(recall, 3),
            "bucket": bucket, "reason": reason,
            "expected": exp_status,
            "predicted": [{"text": s.get("display") or s.get("text", ""),
                           "type": s.get("type", ""),
                           "source": s.get("source", "")} for s in pred_objs],
        })

    # aggregates
    by_bucket = defaultdict(int)
    by_reason = defaultdict(int)
    diff_recall = defaultdict(list)
    type_recall = defaultdict(list)
    for c in cases:
        by_bucket[c["bucket"]] += 1
        by_reason[c["reason"]] += 1
        diff_recall[c["difficulty"]].append(c["recall"])
        type_recall[c["expected_type"]].append(c["recall"])

    def _agg(d):
        return {k: {"mean_recall": round(sum(v) / len(v), 3), "n": len(v)}
                for k, v in sorted(d.items(), key=lambda kv: -len(kv[1]))}

    summary = {
        "engine": engine_name,
        "n": len(cases),
        "mean_recall": round(sum(c["recall"] for c in cases) / len(cases), 3),
        "type_acc": round(sum(c["type_match"] for c in cases) / len(cases), 3),
        "buckets": dict(by_bucket),
        "reasons": dict(sorted(by_reason.items(), key=lambda kv: -kv[1])),
        "by_difficulty": _agg(diff_recall),
        "by_expected_type": _agg(type_recall),
    }
    return {"summary": summary, "cases": cases}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["local", "trie", "service"], default="local",
                    help="'local' = scan fallback engine; 'trie' = trie engine; "
                         "'service' = teammate's Track 4 backend (needs TRACK4_URL)")
    args = ap.parse_args()
    data = analyze(args.source)
    art = Path(__file__).resolve().parent.parent / "artifacts"
    art.mkdir(exist_ok=True)
    (art / "autocomplete_analysis.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2))
    s = data["summary"]
    print(f"engine={s['engine']}  n={s['n']}  mean_recall={s['mean_recall']}  type_acc={s['type_acc']}")
    print("buckets:", s["buckets"])
    print("reasons:", s["reasons"])
    print("by_difficulty:", s["by_difficulty"])
    print("by_expected_type:")
    for k, v in s["by_expected_type"].items():
        print(f"    {k:24} n={v['n']:2}  mean_recall={v['mean_recall']}")
    print(f"[wrote {art/'autocomplete_analysis.json'}]")


if __name__ == "__main__":
    main()
