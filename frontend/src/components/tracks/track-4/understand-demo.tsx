"use client";

import { useRef, useState } from "react";
import { API } from "@/lib/constants";

/**
 * P6 — Search Understanding demo.
 * Ported from ml-service/tascomaps/web/understand.html into React.
 * Messy Vietnamese query → normalized query, intent, entities, confidence.
 * POST /api/v1/track-1-hai/understand
 */

const EXAMPLES = [
  "bv bach mai",
  "atm vcb q7",
  "vincom q1",
  "ks da nang gan bien",
  "chi duong den san bay",
  "12 nguyen hue q1",
  "10.7769,106.7009",
  "galaxy",
  "benh vien bach maj",
  "nt long chau q1",
];

interface UnderstandResult {
  raw: string;
  normalized_query: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  source: string;
}

const surface = { background: "rgba(127,127,127,0.08)", border: "1px solid rgba(127,127,127,0.25)" };
const chip = { fontSize: 12, padding: "4px 10px", borderRadius: 20, ...surface, opacity: 0.9 };

function formatEntityValue(value: unknown): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

export function UnderstandDemo() {
  const [q, setQ] = useState("");
  const [boost, setBoost] = useState(false);
  const [result, setResult] = useState<UnderstandResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const run = async (query?: string) => {
    const value = (query ?? q).trim();
    if (!value) return;
    if (query !== undefined) setQ(query);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(API.TRACK1_HAI_UNDERSTAND, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: value, boost }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as UnderstandResult;
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không thể tải kết quả");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 4px 40px" }}>
      <div style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>
          Search Understanding <span style={chip as React.CSSProperties}>P6</span>
        </h1>
        <p style={{ opacity: 0.65, fontSize: 14, margin: 0 }}>
          Messy Vietnamese query → normalized query, intent, entities, confidence.
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Thử: bv bach mai · atm vcb q7 · 12 nguyen hue q1 · chi duong den san bay"
          autoComplete="off"
          style={{ flex: 1, padding: "15px 16px", fontSize: 16, borderRadius: 12,
            color: "inherit", outline: "none", ...surface }}
        />
        <button
          onClick={() => run()}
          type="button"
          style={{ padding: "0 20px", borderRadius: 12, cursor: "pointer", fontSize: 15,
            color: "inherit", ...surface }}
        >
          Phân tích
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
        {EXAMPLES.map((e) => (
          <button key={e} onClick={() => run(e)} type="button"
            style={{ fontSize: 12, padding: "6px 11px", borderRadius: 20, cursor: "pointer",
              color: "inherit", ...surface }}>{e}</button>
        ))}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, opacity: 0.8, margin: "4px 0 14px" }}>
        <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} />
        Dùng LLM boost (OpenRouter, nếu có key)
      </label>
      <div style={{ borderRadius: 14, padding: 16, ...surface }}>
        <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Kết quả</h2>
        {isLoading ? (
          <div style={{ opacity: 0.5, fontSize: 13 }}>…</div>
        ) : error ? (
          <div style={{ opacity: 0.7, fontSize: 13, color: "#e0685f" }}>{error}</div>
        ) : !result ? (
          <div style={{ opacity: 0.5, fontSize: 13 }}>Nhập truy vấn rồi nhấn Phân tích…</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ opacity: 0.6, fontSize: 13 }}>Intent</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{result.intent}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ opacity: 0.6, fontSize: 13 }}>Normalized</span>
              <strong style={{ fontSize: 14 }}>{result.normalized_query}</strong>
            </div>
            <div style={{ opacity: 0.6, fontSize: 13, marginBottom: 8 }}>Entities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {Object.entries(result.entities || {}).length === 0 ? (
                <span style={{ opacity: 0.5, fontSize: 13 }}>—</span>
              ) : (
                Object.entries(result.entities).map(([k, v]) => (
                  <span key={k} style={chip as React.CSSProperties}>
                    <b style={{ opacity: 0.7 }}>{k}</b>: {formatEntityValue(v)}
                  </span>
                ))
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ opacity: 0.6, fontSize: 13 }}>Confidence</span>
              <span style={{ fontSize: 14 }}>{(result.confidence * 100).toFixed(0)}%</span>
              <span style={chip as React.CSSProperties}>{result.source}</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: "rgba(127,127,127,0.18)", marginTop: 8, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(result.confidence * 100).toFixed(0)}%`,
                background: "linear-gradient(90deg, #8B5CF6, #A78BFA)" }} />
            </div>
            <details style={{ marginTop: 14 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, opacity: 0.7 }}>JSON</summary>
              <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", opacity: 0.8, marginTop: 8 }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
