"""End-to-end evaluation against the three 60-row public gold sets.

    python -m eval.evaluate            # deterministic core
    python -m eval.evaluate --llm      # hybrid (needs OPENROUTER_API_KEY)

Metrics
    P6  intent accuracy, normalized exact / token-F1, entity F1
    P7  Recall@3, Recall@5, MRR, nDCG@3, Hit@1
    P9  suggestion-type accuracy, suggestion recall, full-recall cases
"""
from __future__ import annotations

import argparse
import json
import math
import warnings

warnings.filterwarnings("ignore")

from rapidfuzz import fuzz  # noqa: E402

from tascomaps import config  # noqa: E402
from tascomaps.core.text import fold  # noqa: E402
from tascomaps.core.understand import understand  # noqa: E402
from tascomaps.data.loader import load_eval, load_kb  # noqa: E402


def _ids(s):
    return [x.strip() for x in str(s).split(";") if x.strip()]


def _tok_f1(a: str, b: str) -> float:
    ta, tb = set(fold(a).split()), set(fold(b).split())
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    if not inter:
        return 0.0
    p, r = inter / len(ta), inter / len(tb)
    return 2 * p * r / (p + r)


def _entity_f1(pred: dict, gold: dict):
    """Soft key-value F1: a gold key matches if pred has it with a fuzzy-equal value."""
    def norm(v):
        if isinstance(v, list):
            return " ".join(map(str, v))
        return str(v)
    gkeys = {k: norm(v) for k, v in gold.items() if k not in ("candidates",)}
    pkeys = {k: norm(v) for k, v in (pred or {}).items()}
    if not gkeys:
        return 1.0 if not pkeys else 0.5
    tp = 0
    for k, gv in gkeys.items():
        if k in pkeys and (fold(pkeys[k]) == fold(gv)
                           or fuzz.token_set_ratio(fold(pkeys[k]), fold(gv)) >= 80):
            tp += 1
    p = tp / len(pkeys) if pkeys else 0.0
    r = tp / len(gkeys)
    return 2 * p * r / (p + r) if (p + r) else 0.0


def eval_p6(kb, understander):
    ev = load_eval("T1")
    intent_ok = norm_exact = 0
    norm_f1 = ent_f1 = 0.0
    for row in ev:
        u = understander(row["input_query"])
        intent_ok += u.intent == row["expected_intent"]
        norm_exact += fold(u.normalized_query) == fold(row["expected_normalized_query"])
        norm_f1 += _tok_f1(u.normalized_query, row["expected_normalized_query"])
        try:
            gold = json.loads(row["expected_entities_json"])
        except Exception:
            gold = {}
        ent_f1 += _entity_f1(u.entities, gold)
    n = len(ev)
    return {"n": n, "intent_acc": intent_ok / n, "normalized_exact": norm_exact / n,
            "normalized_tokenF1": norm_f1 / n, "entity_F1": ent_f1 / n}


def eval_p7(engine):
    ev = load_eval("T2")
    R3 = R5 = MRR = NDCG = H1 = 0.0
    for row in ev:
        gold = set(_ids(row["expected_top_poi_ids"]))
        pred = [r["poi_id"] for r in engine.search(row["input_query"], top_k=5)["results"]]
        if not gold:
            continue
        R3 += len(gold & set(pred[:3])) / len(gold)
        R5 += len(gold & set(pred[:5])) / len(gold)
        rr = next((1 / (i + 1) for i, p in enumerate(pred) if p in gold), 0.0)
        MRR += rr
        dcg = sum(1 / math.log2(i + 2) for i, p in enumerate(pred[:3]) if p in gold)
        idcg = sum(1 / math.log2(i + 2) for i in range(min(3, len(gold)))) or 1
        NDCG += dcg / idcg
        H1 += pred[0] in gold if pred else 0
    n = len(ev)
    return {"n": n, "recall@3": R3 / n, "recall@5": R5 / n, "MRR": MRR / n,
            "nDCG@3": NDCG / n, "hit@1": H1 / n}


def eval_p9(suggester):
    ev = load_eval("T4")
    tacc = fuzzy_rec = fuzzy_full = exact_rec = exact_full = mrr = 0.0
    for row in ev:
        out = suggester(row["input_prefix"])
        preds = [s["text"] for s in out["suggestions"]]
        exp = _ids(row["expected_top_suggestions"])
        tacc += out["suggestion_type"] == row["expected_suggestion_type"]
        if exp:
            exact_hits = sum(any(fold(p) == fold(e) for p in preds) for e in exp)
            fuzzy_hits = sum(any(fold(p) == fold(e)
                                 or fuzz.token_set_ratio(fold(e), fold(p)) >= 85
                                 for p in preds) for e in exp)
            exact_ratio = exact_hits / len(exp)
            fuzzy_ratio = fuzzy_hits / len(exp)
            exact_rec += exact_ratio
            fuzzy_rec += fuzzy_ratio
            exact_full += exact_ratio >= 0.999
            fuzzy_full += fuzzy_ratio >= 0.999
            first = next((i for i, p in enumerate(preds)
                          if any(fold(p) == fold(e) for e in exp)), None)
            mrr += 1 / (first + 1) if first is not None else 0.0
    n = len(ev)
    return {"n": n, "type_acc": tacc / n,
            "exact_recall": exact_rec / n, "exact_MRR": mrr / n,
            "exact_full_cases": int(exact_full),
            "fuzzy_recall": fuzzy_rec / n,
            "fuzzy_full_cases": int(fuzzy_full)}


def _fmt(title, d):
    body = "  ".join(f"{k}={v:.3f}" if isinstance(v, float) else f"{k}={v}"
                     for k, v in d.items())
    return f"{title}\n    {body}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true", help="use the OpenRouter LLM boost")
    args = ap.parse_args()

    kb = load_kb()
    if args.llm:
        from tascomaps.llm import boost, client
        print(f"[eval] LLM boost requested; available={client.is_available()}")
        understander = lambda q: boost.boost_understanding(q, kb)  # noqa: E731
    else:
        understander = lambda q: understand(q, kb)  # noqa: E731

    from tascomaps.engines.semantic_search import SemanticSearchEngine
    if config.AC_ENGINE == "trie":
        from tascomaps.engines.trie import TrieAutocomplete
        ac = TrieAutocomplete(kb)
    else:
        from tascomaps.engines.autocomplete import AutocompleteEngine
        ac = AutocompleteEngine(kb)
    ss = SemanticSearchEngine(kb)

    print("=" * 64)
    print(f"TASCO MAPS AI — public gold evaluation  (mode={'hybrid+LLM' if args.llm else 'deterministic'})")
    print("=" * 64)
    print(_fmt("P6  AI Search Understanding (Track 1)", eval_p6(kb, understander)))
    print(_fmt("P7  Semantic Search & Ranking (Track 2)", eval_p7(ss)))
    print(_fmt("P9  Autocomplete & Suggestions (Track 4)",
               eval_p9(lambda p: ac.suggest(p, top_k=6))))
    print("=" * 64)


if __name__ == "__main__":
    main()
