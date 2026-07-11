"""Generate >=10 sample outputs per track for the submission.

    python -m scripts.samples            # print + write artifacts/
    python -m scripts.samples --llm      # use the LLM boost for P6

Writes artifacts/sample_outputs.md and artifacts/sample_outputs.json.
"""
from __future__ import annotations

import argparse
import json
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

from tascomaps.core.understand import understand  # noqa: E402
from tascomaps.data.loader import load_kb  # noqa: E402
from tascomaps.engines.autocomplete import AutocompleteEngine  # noqa: E402
from tascomaps.engines.semantic_search import SemanticSearchEngine  # noqa: E402

P6_QUERIES = [
    "bv bach mai", "atm vcb", "vincom q1", "cafe gan day", "ks da nang gan bien",
    "chi duong den san bay", "12 nguyen hue q1", "10.7769,106.7009", "galaxy",
    "benh vien bach maj", "coffee near ben thanh market", "nt long chau q1",
]
P7_QUERIES = [
    "quán cà phê yên tĩnh để làm việc", "cafe có wifi gần hồ gươm",
    "nơi phù hợp để hẹn hò ở quận 1", "nhà hàng cho gia đình có trẻ nhỏ",
    "khách sạn gần biển đà nẵng có hồ bơi", "quán ăn mở cửa sau 11 giờ tối",
    "atm rút tiền 24/7 gần phố đi bộ nguyễn huệ", "trạm sạc xe điện gần trung tâm đà nẵng",
    "quán cafe học bài ở hoàn kiếm", "địa điểm check-in đẹp ở đà lạt",
]
P9_PREFIXES = [
    "vin", "cafe", "atm", "nguyen h", "ben th", "ks d", "bv bach", "pho th",
    "galaxy", "12 ngu", "atm vcb q", "khach san da n",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--llm", action="store_true")
    args = ap.parse_args()

    kb = load_kb()
    ss = SemanticSearchEngine(kb)
    ac = AutocompleteEngine(kb)
    understander = lambda q: understand(q, kb)  # noqa: E731
    if args.llm:
        from tascomaps.llm import boost
        understander = lambda q: boost.boost_understanding(q, kb)  # noqa: E731

    out = {"P6": [], "P7": [], "P9": []}
    md = ["# Tasco Maps AI — Sample Outputs\n"]

    md.append("## P6 · Search Understanding (query → structured intent)\n")
    for q in P6_QUERIES:
        u = understander(q).to_dict()
        out["P6"].append({"query": q, "output": u})
        md.append(f"- **`{q}`** → intent=`{u['intent']}`, normalized=`{u['normalized_query']}`, "
                  f"entities=`{json.dumps(u['entities'], ensure_ascii=False)}`, conf={u['confidence']}")

    md.append("\n## P7 · Semantic Search & Ranking (needs → ranked places + reasons)\n")
    for q in P7_QUERIES:
        res = ss.search(q, top_k=3)
        out["P7"].append({"query": q, "results": res["results"]})
        md.append(f"- **`{q}`**")
        for r in res["results"]:
            md.append(f"    - {r['name']} ({r['category']}) — score {r['score']:.2f} · "
                      f"{'; '.join(r['reasons'])}")

    md.append("\n## P9 · Autocomplete & Query Suggestions (prefix → ranked suggestions)\n")
    for p in P9_PREFIXES:
        s = ac.suggest(p, top_k=5)
        out["P9"].append({"prefix": p, "output": s})
        sug = "; ".join(f"{x['text']} [{x['type']}]" for x in s["suggestions"])
        md.append(f"- **`{p}`** → {sug}")

    art = Path(__file__).resolve().parent.parent / "artifacts"
    art.mkdir(exist_ok=True)
    (art / "sample_outputs.json").write_text(json.dumps(out, ensure_ascii=False, indent=2))
    (art / "sample_outputs.md").write_text("\n".join(md))
    print("\n".join(md))
    print(f"\n[wrote {art/'sample_outputs.md'} and .json]")


if __name__ == "__main__":
    main()
