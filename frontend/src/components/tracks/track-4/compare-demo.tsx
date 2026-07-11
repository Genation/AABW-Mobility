"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Side-by-side comparison of the two autocomplete engines:
 *   - "Phong" → /api/v1/track-4-phong/suggest (in-repo Deno trie)
 *   - "Hai"   → /api/v1/track-4-hai/suggest   (Python trie + pattern layer)
 * Self-contained + theme-agnostic (translucent surfaces, inherited text color).
 */

const EXAMPLES = [
  "galaxy", "big c", "atm vcb q", "quan an khu", "noi bai atm",
  "cafe", "12 ngu", "ks d", "tra sua ng", "nguyen h",
];

interface Sug { text: string; display: string; type: string; score: number }
interface Resp { suggestions: Sug[]; latencyMs?: number; source?: string; error?: boolean }

async function fetchEngine(path: string, q: string): Promise<Resp> {
  try {
    const r = await fetch(`${path}?q=${encodeURIComponent(q)}&limit=8`);
    if (!r.ok) return { suggestions: [], error: true };
    return await r.json();
  } catch {
    return { suggestions: [], error: true };
  }
}

const surface = { background: "rgba(127,127,127,0.08)", border: "1px solid rgba(127,127,127,0.25)" };
const chip = { fontSize: 11, padding: "2px 8px", borderRadius: 20, ...surface, opacity: 0.85 };

function Column({ title, tag, data }: { title: string; tag: string; data: Resp | null }) {
  return (
    <div style={{ flex: 1, minWidth: 280, borderRadius: 14, padding: 16, ...surface }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
        <strong style={{ fontSize: 15 }}>{title}</strong>
        <span style={chip as React.CSSProperties}>{tag}</span>
      </div>
      {!data ? (
        <div style={{ opacity: 0.5, fontSize: 13 }}>Type above…</div>
      ) : data.error ? (
        <div style={{ opacity: 0.7, fontSize: 13, color: "#e0685f" }}>engine unavailable</div>
      ) : (
        <>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 10 }}>
            source <b>{data.source ?? "—"}</b>
            {data.latencyMs != null && <> · {Number(data.latencyMs).toFixed(2)} ms</>}
            {" · "}{data.suggestions?.length ?? 0} results
          </div>
          {(data.suggestions ?? []).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 9, marginBottom: 6, ...surface }}>
              <span style={{ opacity: 0.4, width: 16, fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14 }}>{s.display || s.text}</span>
              <span style={chip as React.CSSProperties}>{s.type}</span>
              <span style={{ fontSize: 12, opacity: 0.7, fontVariantNumeric: "tabular-nums" }}>
                {(s.score * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export function CompareDemo() {
  const [q, setQ] = useState("");
  const [a, setA] = useState<Resp | null>(null);
  const [b, setB] = useState<Resp | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!q.trim()) return;
    timer.current = setTimeout(async () => {
      const [ra, rb] = await Promise.all([
        fetchEngine("/api/v1/track-4-phong/suggest", q),
        fetchEngine("/api/v1/track-4-hai/suggest", q),
      ]);
      setA(ra); setB(rb);
    }, 110);
    return () => clearTimeout(timer.current);
  }, [q]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 4px 40px" }}>
      <div style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>Autocomplete — track4_phong vs track4_hai</h1>
        <p style={{ opacity: 0.65, fontSize: 14, margin: 0 }}>
          Same query, two engines, live. Left: <b>track4_phong</b> — the existing in-repo Deno
          trie. Right: <b>track4_hai</b> — Hai&apos;s trie + pattern layer (
          1.00 recall on the gold set).
        </p>
      </div>
      <input
        value={q}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQ(nextQuery);
          if (!nextQuery.trim()) {
            setA(null);
            setB(null);
          }
        }}
        placeholder="Gõ để so sánh: galaxy · atm vcb q · quan an khu · noi bai atm · 12 ngu"
        autoComplete="off"
        style={{ width: "100%", padding: "15px 16px", fontSize: 16, borderRadius: 12, marginTop: 16,
          color: "inherit", outline: "none", ...surface }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
        {EXAMPLES.map((e) => (
          <button key={e} onClick={() => setQ(e)} type="button"
            style={{ fontSize: 12, padding: "6px 11px", borderRadius: 20, cursor: "pointer",
              color: "inherit", ...surface }}>{e}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
        <Column title="track4_phong" tag="Deno trie · Phong" data={a} />
        <Column title="track4_hai" tag="Python trie · Hai" data={b} />
      </div>
    </div>
  );
}
