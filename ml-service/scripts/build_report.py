"""Render the autocomplete analysis into a standalone HTML report.

    python -m scripts.analyze_autocomplete   # produces artifacts/autocomplete_analysis.json
    python -m scripts.build_report           # produces artifacts/autocomplete_report.html

The HTML is self-contained (data baked in) — open it directly in a browser.
"""
from __future__ import annotations

import json
from pathlib import Path

ART = Path(__file__).resolve().parent.parent / "artifacts"

HTML = r"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Autocomplete — Success & Failure Analysis</title>
<style>
  .viz-root{
    --surface:#1a1a19; --plane:#0d0d0d; --ink:#ffffff; --ink2:#c3c2b7;
    --muted:#898781; --grid:#2c2c2a; --line:rgba(255,255,255,.10);
    --good:#0ca30c; --warn:#fab219; --bad:#d03b3b; --accent:#3987e5;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--plane);color:var(--ink);
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.45}
  .wrap{max-width:1180px;margin:0 auto;padding:28px 22px 70px}
  h1{font-size:22px;margin:0 0 2px}
  .sub{color:var(--muted);font-size:13px;margin-bottom:22px}
  .card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin:0 0 14px}
  .row{display:grid;gap:16px;margin-bottom:16px}
  .r-tiles{grid-template-columns:repeat(3,1fr) 2fr}
  .r-2{grid-template-columns:1fr 1fr}
  @media(max-width:800px){.r-tiles,.r-2{grid-template-columns:1fr}}
  .tile .v{font-size:34px;font-weight:750;letter-spacing:-.5px}
  .tile .l{color:var(--muted);font-size:12px;margin-top:2px}
  /* stacked bucket bar */
  .stack{display:flex;height:26px;border-radius:7px;overflow:hidden;gap:2px;background:var(--surface);margin-bottom:10px}
  .stack>i{display:block}
  .lg{display:flex;flex-wrap:wrap;gap:14px;font-size:13px}
  .lg span{display:inline-flex;align-items:center;gap:6px;color:var(--ink2)}
  .dot{width:10px;height:10px;border-radius:3px;display:inline-block}
  /* horizontal bars */
  .bars{display:flex;flex-direction:column;gap:9px}
  .bar{display:grid;grid-template-columns:150px 1fr auto;align-items:center;gap:10px;font-size:13px}
  .bar .name{color:var(--ink2);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .track{background:var(--grid);border-radius:20px;height:16px;position:relative;overflow:hidden}
  .track>i{position:absolute;left:0;top:0;bottom:0;background:var(--accent);border-radius:20px}
  .bar .val{color:var(--ink);font-variant-numeric:tabular-nums;min-width:66px;text-align:right}
  .n{color:var(--muted);font-size:11px}
  /* case explorer */
  .filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
  .chip{font-size:13px;padding:6px 13px;border-radius:20px;border:1px solid var(--line);
    background:var(--surface);color:var(--ink2);cursor:pointer;user-select:none}
  .chip.on{background:#26304a;color:#fff;border-color:#39507f}
  .case{border:1px solid var(--line);border-radius:12px;padding:13px 15px;margin-bottom:11px;background:#20242f}
  .case.good{border-left:4px solid var(--good)}
  .case.partial{border-left:4px solid var(--warn)}
  .case.failed{border-left:4px solid var(--bad)}
  .ch{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px}
  .prefix{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;font-weight:700;
    background:#12151d;padding:3px 9px;border-radius:6px}
  .tag{font-size:11px;color:var(--muted)}
  .tag b{color:var(--ink2);font-weight:600}
  .st{margin-left:auto;font-size:12px;font-weight:700;display:inline-flex;gap:6px;align-items:center}
  .st.good{color:var(--good)} .st.partial{color:var(--warn)} .st.failed{color:var(--bad)}
  .lbl{font-size:11px;color:var(--muted);margin:6px 0 4px}
  .sg{display:flex;flex-wrap:wrap;gap:6px}
  .s{font-size:12.5px;padding:4px 10px;border-radius:8px;border:1px solid var(--line);background:var(--surface)}
  .s.hit{border-color:rgba(12,163,12,.5);background:rgba(12,163,12,.13);color:#8ce68c}
  .s.miss{border-color:rgba(208,59,59,.5);background:rgba(208,59,59,.13);color:#f0a0a0}
  .s .ty{color:var(--muted);font-size:10px;margin-left:5px}
  .arrow{color:var(--muted)}
  .empty{color:var(--muted);font-size:12.5px;font-style:italic}
</style></head>
<body><div class="viz-root wrap" data-palette="#0ca30c,#fab219,#d03b3b,#3987e5">
  <h1>Autocomplete — Success &amp; Failure Analysis</h1>
  <div class="sub" id="sub"></div>

  <div class="row r-tiles">
    <div class="card tile"><div class="v" id="t-recall"></div><div class="l">mean suggestion recall</div></div>
    <div class="card tile"><div class="v" id="t-type"></div><div class="l">suggestion-type accuracy</div></div>
    <div class="card tile"><div class="v" id="t-n"></div><div class="l">gold cases (Track 4)</div></div>
    <div class="card"><h2>Case outcomes</h2>
      <div class="stack" id="stack"></div><div class="lg" id="stack-lg"></div></div>
  </div>

  <div class="row r-2">
    <div class="card"><h2>Mean recall by difficulty</h2><div class="bars" id="b-diff"></div></div>
    <div class="card"><h2>Mean recall by expected type — worst first</h2><div class="bars" id="b-type"></div></div>
  </div>

  <div class="row"><div class="card"><h2>Failure reasons (case count)</h2><div class="bars" id="b-reason"></div></div></div>

  <div class="row"><div class="card">
    <h2>Case explorer — expected vs. produced suggestions</h2>
    <div class="filters" id="filters"></div>
    <div id="cases"></div>
  </div></div>
</div>
<script id="data" type="application/json">__DATA__</script>
<script>
const D=JSON.parse(document.getElementById("data").textContent);
const S=D.summary, C=D.cases;
const esc=s=>(s==null?"":String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const pct=x=>Math.round(x*100)+"%";
const COL={good:"var(--good)",partial:"var(--warn)",failed:"var(--bad)"};
const ICON={good:"✓",partial:"~",failed:"✗"};

document.getElementById("sub").textContent=
  `${S.n} cases · engine: ${S.engine||"local-fallback"} · matched = fuzzy token-set ≥ 85`;
document.getElementById("t-recall").textContent=pct(S.mean_recall);
document.getElementById("t-type").textContent=pct(S.type_acc);
document.getElementById("t-n").textContent=S.n;

// bucket stack
const order=["good","partial","failed"];
document.getElementById("stack").innerHTML=order.map(b=>{
  const n=S.buckets[b]||0; return `<i style="flex:${n};background:${COL[b]}" title="${b}: ${n}"></i>`;}).join("");
document.getElementById("stack-lg").innerHTML=order.map(b=>
  `<span><span class="dot" style="background:${COL[b]}"></span>${ICON[b]} ${b[0].toUpperCase()+b.slice(1)} — <b>&nbsp;${S.buckets[b]||0}</b></span>`).join("");

function bars(el,rows,{asPct=true,max=null}={}){
  const mx=max!=null?max:Math.max(...rows.map(r=>r.v),1e-9);
  el.innerHTML=rows.map(r=>{
    const w=Math.max(1,(r.v/mx)*100);
    const val=asPct?pct(r.v):r.v;
    return `<div class="bar"><span class="name" title="${esc(r.name)}">${esc(r.name)}</span>
      <span class="track"><i style="width:${w}%"></i></span>
      <span class="val">${val}${r.n!=null?` <span class="n">n=${r.n}</span>`:""}</span></div>`;}).join("");
}
bars(document.getElementById("b-diff"),
  ["Easy","Medium","Hard"].filter(d=>S.by_difficulty[d]).map(d=>({name:d,v:S.by_difficulty[d].mean_recall,n:S.by_difficulty[d].n})),{max:1});
bars(document.getElementById("b-type"),
  Object.entries(S.by_expected_type).map(([k,v])=>({name:k,v:v.mean_recall,n:v.n}))
    .sort((a,b)=>a.v-b.v),{max:1});
bars(document.getElementById("b-reason"),
  Object.entries(S.reasons).filter(([k])=>k!=="ok").map(([k,v])=>({name:k,v:v})),{asPct:false});

// case explorer
const counts={all:C.length,failed:0,partial:0,good:0};
C.forEach(c=>counts[c.bucket]++);
let filter="failed";
const FTS=[["failed","✗ Failed"],["partial","~ Partial"],["good","✓ Good"],["all","All"]];
const fEl=document.getElementById("filters");
function drawFilters(){
  fEl.innerHTML=FTS.map(([k,l])=>`<span class="chip ${k===filter?"on":""}" data-f="${k}">${l} (${counts[k]})</span>`).join("");
  fEl.querySelectorAll(".chip").forEach(ch=>ch.onclick=()=>{filter=ch.dataset.f;drawFilters();drawCases();});
}
function drawCases(){
  const list=C.filter(c=>filter==="all"||c.bucket===filter);
  document.getElementById("cases").innerHTML=list.map(c=>{
    const exp=c.expected.map(e=>`<span class="s ${e.matched?"hit":"miss"}">${e.matched?"✓":"✗"} ${esc(e.text)}</span>`).join("");
    const got=c.predicted.length?c.predicted.map(p=>`<span class="s">${esc(p.text)}<span class="ty">${esc(p.type)}·${esc(p.source)}</span></span>`).join("")
      :`<span class="empty">— no suggestions returned —</span>`;
    return `<div class="case ${c.bucket}">
      <div class="ch">
        <span class="prefix">${esc(c.prefix)}</span>
        <span class="tag">${esc(c.difficulty)}</span>
        <span class="tag"><b>${esc(c.expected_type)}</b> <span class="arrow">→</span> ${esc(c.predicted_type||"—")} ${c.type_match?"✓":"✗"}</span>
        <span class="st ${c.bucket}">${ICON[c.bucket]} ${pct(c.recall)} recall</span>
      </div>
      <div class="lbl">Expected (gold)</div><div class="sg">${exp}</div>
      <div class="lbl">Produced</div><div class="sg">${got}</div>
    </div>`;}).join("") || `<div class="empty">No cases.</div>`;
}
drawFilters();drawCases();
</script>
</body></html>
"""


def main():
    data = json.loads((ART / "autocomplete_analysis.json").read_text())
    html = HTML.replace("__DATA__", json.dumps(data, ensure_ascii=False))
    out = ART / "autocomplete_report.html"
    out.write_text(html, encoding="utf-8")
    print(f"[wrote {out}]  ({len(html)//1024} KB, {data['summary']['n']} cases)")


if __name__ == "__main__":
    main()
