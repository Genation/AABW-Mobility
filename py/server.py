"""
RouteMate NER — Test UI Server
================================
Flask webapp for testing & evaluating the NER engine.
Run: python server.py [--port 5000]
"""

from __future__ import annotations

import json
import sys
import io
import time
import threading
from pathlib import Path
from collections import defaultdict

if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

from flask import Flask, request, jsonify, render_template_string
from ner_engine import NerEngine, TOOL_REGISTRY
from eval_dataset import load_dataset

app = Flask(__name__)
engine = NerEngine()

# ── In-memory metrics ────────────────────────────────────────────────────────

class Metrics:
    def __init__(self):
        self.lock = threading.Lock()
        self.total_requests = 0
        self.total_latency_ms = 0.0
        self.recent_queries: list[dict] = []  # last 50
        self.tool_counts: dict[str, int] = defaultdict(int)
        self.entity_field_counts: dict[str, int] = defaultdict(int)
        self.eval_results: dict | None = None

    def record(self, query: str, result, latency_ms: float):
        with self.lock:
            self.total_requests += 1
            self.total_latency_ms += latency_ms
            self.tool_counts[result.tool] += 1
            for field in result.hard_filters:
                self.entity_field_counts[field] += 1
            self.recent_queries.append({
                "query": query,
                "tool": result.tool,
                "completed": result.completed_query,
                "filters": result.hard_filters,
                "cleaned": result.cleaned_query,
                "latency_ms": round(latency_ms, 1),
                "confidence": result.confidence,
            })
            if len(self.recent_queries) > 50:
                self.recent_queries = self.recent_queries[-50:]

    def summary(self) -> dict:
        with self.lock:
            avg_lat = self.total_latency_ms / max(self.total_requests, 1)
            return {
                "total_requests": self.total_requests,
                "avg_latency_ms": round(avg_lat, 1),
                "tool_distribution": dict(self.tool_counts),
                "entity_field_hits": dict(self.entity_field_counts),
                "recent_queries": list(reversed(self.recent_queries))[:20],
                "eval_results": self.eval_results,
            }


metrics = Metrics()

# ── HTML Template ────────────────────────────────────────────────────────────

HTML = r"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RouteMate NER — Test Console</title>
<style>
  :root { --bg:#0d1117; --card:#161b22; --border:#30363d; --text:#c9d1d9; --accent:#58a6ff; --green:#3fb950; --yellow:#d2991d; --red:#f85149; --purple:#bc8cff; --dim:#8b949e; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',system-ui,sans-serif; background:var(--bg); color:var(--text); min-height:100vh; }
  .app { max-width:1400px; margin:0 auto; padding:16px; display:grid; grid-template-columns:1fr 380px; gap:16px; }
  @media(max-width:900px){ .app { grid-template-columns:1fr; } }
  .card { background:var(--card); border:1px solid var(--border); border-radius:8px; padding:16px; margin-bottom:12px; }
  h2 { font-size:15px; color:var(--accent); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  h2 .dot { width:8px; height:8px; border-radius:50%; background:var(--green); display:inline-block; }
  input, textarea, select, button { background:var(--bg); color:var(--text); border:1px solid var(--border); border-radius:6px; padding:10px 14px; font-size:14px; font-family:inherit; outline:none; }
  input:focus, textarea:focus { border-color:var(--accent); }
  button { cursor:pointer; background:var(--accent); color:#fff; border:none; font-weight:600; transition:opacity .2s; }
  button:hover { opacity:.85; }
  button.secondary { background:var(--border); color:var(--text); }
  .query-row { display:flex; gap:8px; margin-bottom:8px; }
  .query-row input { flex:1; }
  .result-box { background:var(--bg); border:1px solid var(--border); border-radius:6px; padding:12px; margin-top:8px; font-family:'Cascadia Code','Fira Code',monospace; font-size:13px; line-height:1.6; white-space:pre-wrap; word-break:break-all; max-height:400px; overflow-y:auto; }
  .filter-tag { display:inline-block; background:#1a3a5c; color:var(--accent); padding:2px 8px; border-radius:4px; margin:2px; font-size:12px; }
  .filter-key { color:var(--purple); }
  .filter-val { color:var(--text); }
  .tool-badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; }
  .tool-brand { background:#1a3a2c; color:var(--green); }
  .tool-poi { background:#1a2a3c; color:var(--accent); }
  .tool-address { background:#2a1a3c; color:var(--purple); }
  .tool-category { background:#3a2a1a; color:var(--yellow); }
  .tool-nearby { background:#2a3a1a; color:#7ee787; }
  .tool-attribute { background:#1a3a3a; color:#79c0ff; }
  .tool-discovery { background:#3a1a2a; color:#ff7b72; }
  .tool-navigation { background:#1a1a3a; color:#d2a8ff; }
  .tool-coordinate { background:#3a3a1a; color:#ffa657; }
  .tool-ambiguous { background:#3a3a3a; color:var(--dim); }
  .log-entry { padding:4px 8px; border-bottom:1px solid var(--border); font-size:12px; display:flex; gap:8px; align-items:center; }
  .log-entry:hover { background:#1c2128; }
  .log-query { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .latency { color:var(--green); font-variant-numeric:tabular-nums; min-width:55px; text-align:right; }
  .latency-slow { color:var(--yellow); }
  .latency-bad { color:var(--red); }
  .metric-row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #1c2128; font-size:13px; }
  .metric-val { font-weight:600; color:var(--accent); }
  .tabs { display:flex; gap:4px; margin-bottom:10px; }
  .tab { padding:6px 14px; border-radius:6px 6px 0 0; font-size:13px; cursor:pointer; background:var(--bg); border:1px solid var(--border); color:var(--dim); }
  .tab.active { background:var(--card); color:var(--accent); border-bottom-color:var(--card); }
  .tab-content { display:none; }
  .tab-content.active { display:block; }
  .eval-result { padding:4px 8px; font-size:12px; display:flex; gap:8px; align-items:center; border-bottom:1px solid #1c2128; }
  .eval-pass { color:var(--green); min-width:16px; }
  .eval-fail { color:var(--red); min-width:16px; }
  .status-bar { font-size:12px; color:var(--dim); display:flex; gap:16px; padding:4px 0; }
  .spinner { display:none; width:16px; height:16px; border:2px solid var(--border); border-top-color:var(--accent); border-radius:50%; animation:spin .6s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
</style>
</head>
<body>
<div class="app">
<div class="main">
  <div class="card">
    <h2><span class="dot"></span> RouteMate NER — Test Console</h2>
    <div class="query-row">
      <input id="queryInput" type="text" placeholder="Nhập query (vd: Mường Thanh Đà Nẵng có hồ bơi view biển đẹp)" autofocus onkeydown="if(event.key==='Enter')sendQuery()">
      <button onclick="sendQuery()">Parse</button>
      <div class="spinner" id="spinner"></div>
    </div>
    <div class="status-bar">
      <span id="statusText">Sẵn sàng</span>
      <span id="latencyText"></span>
    </div>
    <div class="result-box" id="resultBox" style="display:none"></div>
  </div>

  <div class="card">
    <h2>📋 Recent Queries</h2>
    <div id="recentLog" style="max-height:360px;overflow-y:auto"></div>
  </div>
</div>

<div class="side">
  <div class="card">
    <h2>📊 Live Metrics</h2>
    <div id="metricsPanel"></div>
  </div>

  <div class="card">
    <h2>🔬 Evaluation</h2>
    <div class="query-row">
      <input id="evalLimit" type="number" value="15" min="1" max="60" style="width:70px" title="Số case test">
      <button onclick="runEval()">Run Eval</button>
      <button class="secondary" onclick="runEval(60)">All 60</button>
    </div>
    <div id="evalPanel" style="max-height:400px;overflow-y:auto;font-size:12px"></div>
  </div>
</div>
</div>

<script>
const $ = id => document.getElementById(id);

function toolClass(tool) {
  const m = {brand_suggestion:'tool-brand',poi_suggestion:'tool-poi',address_suggestion:'tool-address',category_search:'tool-category',nearby_search:'tool-nearby',attribute_search:'tool-attribute',discovery_search:'tool-discovery',navigation:'tool-navigation',coordinate_search:'tool-coordinate',ambiguous:'tool-ambiguous'};
  return m[tool] || 'tool-ambiguous';
}

function formatFilters(f) {
  if (!f || !Object.keys(f).length) return '<span style="color:var(--dim)">  {}</span>';
  let html = '';
  for (const [k, v] of Object.entries(f)) {
    html += `  <span class="filter-key">"${k}"</span>: <span class="filter-val">"${v}"</span><br>`;
  }
  return html;
}

function latencyClass(ms) {
  if (ms < 400) return '';
  if (ms < 800) return 'latency-slow';
  return 'latency-bad';
}

async function sendQuery() {
  const q = $('queryInput').value.trim();
  if (!q) return;
  $('spinner').style.display = 'inline-block';
  $('statusText').textContent = 'Đang xử lý...';
  try {
    const t0 = performance.now();
    const r = await fetch('/api/parse', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})});
    const d = await r.json();
    const t1 = performance.now();
    const box = $('resultBox');
    box.style.display = 'block';
    box.innerHTML =
      `<div style="margin-bottom:8px"><span class="tool-badge ${toolClass(d.tool)}">${d.tool}</span> <span style="color:var(--dim);margin-left:8px">confidence: ${(d.confidence*100).toFixed(0)}%</span></div>
<b style="color:var(--accent)">Hard Filters (match):</b><br>${formatFilters(d.hard_filters)}
<b style="color:var(--accent)">Cleaned Query (semantic):</b> <span style="color:var(--green)">"${d.cleaned_query || '(empty)'}"</span><br>
<b style="color:var(--accent)">Suggestions:</b> ${(d.suggestions||[]).join('; ') || '(none)'}<br>
<b style="color:var(--accent)">Completed:</b> ${d.completed_query}`;
    $('statusText').textContent = `OK | ${d.latency_ms?.toFixed(0) || 0}ms`;
    refreshAll();
  } catch(e) {
    $('statusText').textContent = 'Lỗi: ' + e.message;
  }
  $('spinner').style.display = 'none';
}

async function refreshAll() {
  const r = await fetch('/api/metrics');
  const m = await r.json();
  renderMetrics(m);
  renderLog(m);
}

function renderMetrics(m) {
  const total = m.total_requests || 0;
  let html = `<div class="metric-row"><span>Tổng requests</span><span class="metric-val">${total}</span></div>`;
  html += `<div class="metric-row"><span>Avg Latency</span><span class="metric-val">${m.avg_latency_ms}ms</span></div>`;
  html += `<div class="metric-row"><span>Entity Fields Hit</span><span class="metric-val">${total ? (m.entity_field_hits ? Object.keys(m.entity_field_hits).length : 0) : 0} fields</span></div>`;
  if (m.tool_distribution && Object.keys(m.tool_distribution).length) {
    html += '<div style="margin-top:8px;font-size:12px;color:var(--dim)">Tool Distribution:</div>';
    for (const [t, c] of Object.entries(m.tool_distribution)) {
      html += `<div class="metric-row"><span class="tool-badge ${toolClass(t)}" style="font-size:11px">${t}</span><span>${c}</span></div>`;
    }
  }
  $('metricsPanel').innerHTML = html;
}

function renderLog(m) {
  const queries = m.recent_queries || [];
  let html = '';
  for (const q of queries) {
    const filters = Object.entries(q.filters||{}).map(([k,v]) => `<span class="filter-tag"><span class="filter-key">${k}</span>: <span class="filter-val">${v}</span></span>`).join(' ');
    html += `<div class="log-entry">
      <span class="tool-badge ${toolClass(q.tool)}" style="font-size:10px;padding:1px 6px">${q.tool.split('_')[0]}</span>
      <span class="log-query" title="${q.query}">${q.completed || q.query}</span>
      ${filters ? `<span>${filters}</span>` : ''}
      <span class="latency ${latencyClass(q.latency_ms)}">${q.latency_ms}ms</span>
    </div>`;
  }
  $('recentLog').innerHTML = html || '<div style="color:var(--dim);padding:8px">Chưa có query nào</div>';
}

async function runEval(limit) {
  limit = limit || parseInt($('evalLimit').value) || 15;
  $('evalPanel').innerHTML = '<div style="color:var(--dim);padding:8px">Đang chạy eval ' + limit + ' cases...</div>';
  const r = await fetch('/api/eval?limit=' + limit);
  const d = await r.json();
  let html = `<div style="margin-bottom:8px;font-weight:600">Tool Acc: <span style="color:${d.tool_accuracy>=0.4?'var(--green)':'var(--yellow)'}">${(d.tool_accuracy*100).toFixed(1)}%</span> | Entity Recall: <span style="color:${d.entity_recall>=0.9?'var(--green)':'var(--yellow)'}">${(d.entity_recall*100).toFixed(1)}%</span> | Avg Lat: ${d.avg_latency_ms}ms</div>`;
  html += '<div style="margin-bottom:8px;font-size:11px;color:var(--dim)">✓ = tool match | ✗ = tool mismatch</div>';
  for (const r of (d.details||[])) {
    const icon = r.tool_match ? '<span class="eval-pass">✓</span>' : '<span class="eval-fail">✗</span>';
    html += `<div class="eval-result">${icon} <b>${r.case_id}</b> <span style="color:var(--dim)">"${r.input_query}"</span> → <span class="tool-badge ${toolClass(r.predicted_tool)}" style="font-size:10px">${r.predicted_tool}</span> <span style="color:var(--dim)">(exp: ${r.expected_tool})</span> <span style="margin-left:auto;font-size:11px">R:${(r.entity_recall*100).toFixed(0)}%</span></div>`;
  }
  $('evalPanel').innerHTML = html;
  // Also refresh metrics since eval updates them
  refreshAll();
}

// Initial load
refreshAll();
setInterval(refreshAll, 3000);
</script>
</body>
</html>"""


# ═══════════════════════════════════════════════════════════════════════════════
# Routes
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    return render_template_string(HTML)


@app.route("/api/parse", methods=["POST"])
def api_parse():
    data = request.get_json(force=True)
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "empty query"}), 400

    t0 = time.perf_counter()
    result = engine.parse(query)
    elapsed = (time.perf_counter() - t0) * 1000

    metrics.record(query, result, elapsed)

    return jsonify({
        "tool": result.tool,
        "completed_query": result.completed_query,
        "hard_filters": result.hard_filters,
        "cleaned_query": result.cleaned_query,
        "suggestions": result.suggestions,
        "confidence": result.confidence,
        "latency_ms": round(elapsed, 1),
        "raw_llm_output": result.raw_llm_output,
    })


@app.route("/api/metrics")
def api_metrics():
    return jsonify(metrics.summary())


@app.route("/api/eval")
def api_eval():
    from run_eval import run_evaluation, build_summary
    limit = request.args.get("limit", 15, type=int)
    results, stats = run_evaluation(limit=limit)
    # Cache in metrics
    metrics.eval_results = {
        "tool_accuracy": stats.tool_accuracy,
        "entity_recall": stats.entity_recall,
        "suggestion_overlap": stats.suggestion_overlap,
        "avg_latency_ms": stats.avg_latency_ms,
        "total": stats.total,
        "details": [
            {
                "case_id": r.case_id,
                "input_query": r.input_query,
                "expected_tool": r.expected_tool,
                "predicted_tool": r.predicted_tool,
                "tool_match": r.tool_match,
                "entity_recall": r.entity_recall,
            }
            for r in results
        ],
    }
    return jsonify(metrics.eval_results)


# ═══════════════════════════════════════════════════════════════════════════════
# Entrypoint
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=5000)
    p.add_argument("--host", default="0.0.0.0")
    args = p.parse_args()

    print(f"\n  RouteMate NER Test Console")
    print(f"  http://{args.host}:{args.port}\n")
    app.run(host=args.host, port=args.port, debug=False)
