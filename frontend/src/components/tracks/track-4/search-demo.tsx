"use client";

import { useRef, useState } from "react";
import { API } from "@/lib/constants";

/**
 * P7 — Semantic Search & Ranking demo.
 * Ported from ml-service/tascomaps/web/search.html into React.
 * Search by needs/attributes → ranked places with reasons
 * (embeddings + BM25 + multi-signal ranking).
 * POST /api/v1/track-2-hai/search
 */

const EXAMPLES = [
  "quán cà phê yên tĩnh để làm việc",
  "cafe có wifi gần hồ gươm",
  "nơi phù hợp để hẹn hò ở quận 1",
  "nhà hàng cho gia đình có trẻ nhỏ",
  "khách sạn gần biển đà nẵng có hồ bơi",
  "quán ăn mở cửa sau 11 giờ tối",
  "trạm sạc xe điện gần trung tâm đà nẵng",
  "địa điểm check-in đẹp ở đà lạt",
];

interface SearchResultItem {
  poi_id: string;
  name: string;
  display_name?: string;
  address?: string;
  category: string;
  district?: string;
  city?: string;
  rating?: number | null;
  review_count?: number;
  score: number;
  reasons: string[];
  signals?: Record<string, number>;
}

interface SearchResult {
  query: string;
  understanding: { intent?: string; entities?: Record<string, unknown> };
  required_attributes: string[];
  excluded_attributes?: string[];
  results: SearchResultItem[];
  diagnostics?: { status?: string };
}

const surface = { background: "rgba(127,127,127,0.08)", border: "1px solid rgba(127,127,127,0.25)" };
const chip = { fontSize: 12, padding: "4px 10px", borderRadius: 20, ...surface, opacity: 0.9 };

export function SearchDemo() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
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
      const res = await fetch(API.TRACK2_HAI_SEARCH, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: value, top_k: 5 }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as SearchResult;
      setResult(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Không thể tải kết quả");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const understanding = result?.understanding ?? {};
  const required = result?.required_attributes ?? [];
  const excluded = result?.excluded_attributes ?? [];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "8px 4px 40px" }}>
      <div style={{ marginBottom: 6 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 4px" }}>
          Semantic Search &amp; Ranking <span style={chip as React.CSSProperties}>P7</span>
        </h1>
        <p style={{ opacity: 0.65, fontSize: 14, margin: 0 }}>
          Search by needs/attributes → ranked places with reasons (embeddings + BM25 + multi-signal).
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Thử: quán cà phê yên tĩnh để làm việc · khách sạn gần biển đà nẵng có hồ bơi"
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
          Tìm kiếm
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
        {EXAMPLES.map((e) => (
          <button key={e} onClick={() => run(e)} type="button"
            style={{ fontSize: 12, padding: "6px 11px", borderRadius: 20, cursor: "pointer",
              color: "inherit", ...surface }}>{e}</button>
        ))}
      </div>
      <div style={{ borderRadius: 14, padding: 16, ...surface }}>
        <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>Kết quả xếp hạng</h2>
        {isLoading ? (
          <div style={{ opacity: 0.5, fontSize: 13 }}>…</div>
        ) : error ? (
          <div style={{ opacity: 0.7, fontSize: 13, color: "#e0685f" }}>{error}</div>
        ) : !result ? (
          <div style={{ opacity: 0.5, fontSize: 13 }}>Nhập nhu cầu rồi nhấn Tìm kiếm…</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ opacity: 0.6, fontSize: 13 }}>Hiểu truy vấn</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{understanding.intent ?? ""}</span>
              <span style={{ opacity: 0.5, fontSize: 12 }}>
                {JSON.stringify(understanding.entities ?? {})}
              </span>
            </div>
            <div style={{ opacity: 0.5, fontSize: 12, marginTop: 6 }}>
              status: {result.diagnostics?.status ?? "ok"}
            </div>
            {(required.length > 0 || excluded.length > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 4px" }}>
                {required.map((a) => (
                  <span key={`req-${a}`} style={{ ...chip, fontWeight: 600 } as React.CSSProperties}>{a}</span>
                ))}
                {excluded.map((a) => (
                  <span key={`exc-${a}`} style={chip as React.CSSProperties}>không {a}</span>
                ))}
              </div>
            )}
            {(!result.results || result.results.length === 0) ? (
              <div style={{ opacity: 0.5, fontSize: 13, marginTop: 14 }}>Không có kết quả.</div>
            ) : (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {result.results.map((r) => (
                  <div key={r.poi_id} style={{ borderRadius: 10, padding: 12, ...surface }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.display_name || r.name}</span>
                      <span style={{ fontSize: 13, opacity: 0.75, fontVariantNumeric: "tabular-nums" }}>
                        utility {Number(r.score).toFixed(2)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>
                      {r.category} · {r.district || r.city || ""}
                      {r.address ? ` · ${r.address}` : ""}
                      {r.rating ? ` · ★${r.rating}` : ""}
                      {r.review_count ? ` · ${r.review_count} reviews` : ""}
                    </div>
                    {r.reasons?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                        {r.reasons.map((reason, i) => (
                          <span key={i} style={chip as React.CSSProperties}>{reason}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
