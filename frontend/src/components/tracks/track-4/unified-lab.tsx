"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API } from "@/lib/constants";
import styles from "./unified-lab.module.css";

/**
 * Unified AI Search Lab.
 * React port of ml-service/tascomaps/web/lab.html, restyled with the frontend
 * design tokens (glass surfaces + dark/light theme).
 *
 * Three models, run each on its own or all at once via "Run all models":
 *   - P9 Autocomplete      → GET  /api/v1/track-4-hai/suggest
 *   - P6 Query understanding → POST /api/v1/track-1-hai/understand
 *   - P7 Semantic ranking    → POST /api/v1/track-2-hai/search
 * Picking a P9 suggestion copies it into the P6 and P7 inputs (the journey).
 */

type Stage = "ready" | "running" | "done" | "error";

interface Sug {
  text: string;
  display: string;
  type: string;
  score: number;
  source?: string;
}

interface UnderstandResult {
  raw: string;
  normalized_query: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  source: string;
}

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
  understanding?: { intent?: string; entities?: Record<string, unknown> };
  required_attributes?: string[];
  excluded_attributes?: string[];
  results: SearchResultItem[];
  diagnostics?: { status?: string };
}

const P9_TESTS = ["vin q1", "highl wifi", "trun tâm thương mại gần tôi"];
const P6_TESTS = ["đại học", "phuc l q1", "chi duong den san bay", "trun tâm thương mại gần tôi"];
const P7_TESTS = [
  "quán cafe học bài",
  "khách sạn gần biển có hồ bơi",
  "nơi hẹn hò ở quận 1",
  "đại học",
];

const STATE_LABEL: Record<Stage, string> = {
  ready: "Ready",
  running: "Running",
  done: "Complete",
  error: "Error",
};

const pct = (v: unknown) => `${Math.round((Number(v) || 0) * 100)}%`;

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

function errMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Request failed";
}

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    /* keep empty */
  }
  if (!res.ok) {
    const detail = (data as { detail?: string })?.detail;
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return data as T;
}

function formatEntity(value: unknown): string {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

export function UnifiedLab() {
  /* ----- P9 autocomplete ----- */
  const [p9Input, setP9Input] = useState("cafe co wifi");
  const [p9State, setP9State] = useState<Stage>("ready");
  const [p9Meta, setP9Meta] = useState("Waiting for a prefix");
  const [p9Sug, setP9Sug] = useState<Sug[] | null>(null);
  const p9Val = useRef("cafe co wifi");
  const p9Seq = useRef(0);
  const p9Ctrl = useRef<AbortController | null>(null);
  const p9Debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ----- P6 understanding ----- */
  const [p6Input, setP6Input] = useState("highl wifi");
  const [p6State, setP6State] = useState<Stage>("ready");
  const [p6Meta, setP6Meta] = useState("Waiting for a query");
  const [p6Res, setP6Res] = useState<UnderstandResult | null>(null);
  const p6Val = useRef("highl wifi");
  const p6Seq = useRef(0);
  const p6Ctrl = useRef<AbortController | null>(null);

  /* ----- P7 ranking ----- */
  const [p7Input, setP7Input] = useState("cafe có wifi gần hồ gươm");
  const [p7State, setP7State] = useState<Stage>("ready");
  const [p7Meta, setP7Meta] = useState("Waiting for a search need");
  const [p7Res, setP7Res] = useState<SearchResult | null>(null);
  const p7Val = useRef("cafe có wifi gần hồ gươm");
  const p7Seq = useRef(0);
  const p7Ctrl = useRef<AbortController | null>(null);

  const [runningAll, setRunningAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }, []);

  /* --------------------------- runners --------------------------- */

  const runP9 = useCallback(async () => {
    const value = p9Val.current.trim();
    if (!value) {
      p9Ctrl.current?.abort();
      p9Seq.current++;
      setP9State("ready");
      setP9Meta("Waiting for a prefix");
      setP9Sug(null);
      return;
    }
    const seq = ++p9Seq.current;
    p9Ctrl.current?.abort();
    const ctrl = new AbortController();
    p9Ctrl.current = ctrl;
    setP9State("running");
    try {
      const data = await fetchJson<{
        suggestions?: Sug[];
        source?: string;
      }>(`${API.TRACK4_HAI_SUGGEST}?q=${encodeURIComponent(value)}&limit=6`, {
        signal: ctrl.signal,
      });
      if (seq !== p9Seq.current) return;
      const suggestions = data.suggestions ?? [];
      setP9Sug(suggestions);
      setP9State("done");
      setP9Meta(
        `${data.source ?? "local"} · ${suggestions.length} suggestions`,
      );
    } catch (err) {
      if (isAbort(err) || seq !== p9Seq.current) return;
      setP9State("error");
      setP9Meta(errMessage(err));
      setP9Sug(null);
    }
  }, []);

  const runP6 = useCallback(async () => {
    const value = p6Val.current.trim();
    if (!value) {
      p6Ctrl.current?.abort();
      p6Seq.current++;
      setP6State("ready");
      setP6Meta("Waiting for a query");
      setP6Res(null);
      return;
    }
    const seq = ++p6Seq.current;
    p6Ctrl.current?.abort();
    const ctrl = new AbortController();
    p6Ctrl.current = ctrl;
    setP6State("running");
    try {
      const data = await fetchJson<UnderstandResult>(
        API.TRACK1_HAI_UNDERSTAND,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: value, boost: false }),
          signal: ctrl.signal,
        },
      );
      if (seq !== p6Seq.current) return;
      setP6Res(data);
      setP6State("done");
      setP6Meta(`${data.source ?? "deterministic"}`);
    } catch (err) {
      if (isAbort(err) || seq !== p6Seq.current) return;
      setP6State("error");
      setP6Meta(errMessage(err));
      setP6Res(null);
    }
  }, []);

  const runP7 = useCallback(async () => {
    const value = p7Val.current.trim();
    if (!value) {
      p7Ctrl.current?.abort();
      p7Seq.current++;
      setP7State("ready");
      setP7Meta("Waiting for a search need");
      setP7Res(null);
      return;
    }
    const seq = ++p7Seq.current;
    p7Ctrl.current?.abort();
    const ctrl = new AbortController();
    p7Ctrl.current = ctrl;
    setP7State("running");
    try {
      const data = await fetchJson<SearchResult>(
        API.TRACK2_HAI_SEARCH,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: value, top_k: 5 }),
          signal: ctrl.signal,
        },
      );
      if (seq !== p7Seq.current) return;
      setP7Res(data);
      setP7State("done");
      const status = data.diagnostics?.status ?? "ok";
      setP7Meta(
        `${data.results?.length ?? 0} ranked · status ${status}`,
      );
    } catch (err) {
      if (isAbort(err) || seq !== p7Seq.current) return;
      setP7State("error");
      setP7Meta(errMessage(err));
      setP7Res(null);
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    await Promise.allSettled([runP9(), runP6(), runP7()]);
    setRunningAll(false);
    showToast("All three models finished");
  }, [runP9, runP6, runP7, showToast]);

  /* --------------------------- input helpers --------------------------- */

  const onP9Change = useCallback(
    (v: string) => {
      p9Val.current = v;
      setP9Input(v);
      if (p9Debounce.current) clearTimeout(p9Debounce.current);
      p9Debounce.current = setTimeout(runP9, 180);
    },
    [runP9],
  );

  const setP9Test = useCallback(
    (v: string) => {
      p9Val.current = v;
      setP9Input(v);
      runP9();
    },
    [runP9],
  );

  const setP6Value = useCallback(
    (v: string, run: boolean) => {
      p6Val.current = v;
      setP6Input(v);
      if (run) runP6();
    },
    [runP6],
  );

  const setP7Value = useCallback(
    (v: string, run: boolean) => {
      p7Val.current = v;
      setP7Input(v);
      if (run) runP7();
    },
    [runP7],
  );

  const sendToDownstream = useCallback(
    (value: string) => {
      setP6Value(value, false);
      setP7Value(value, false);
      showToast("Copied into P6 & P7");
    },
    [setP6Value, setP7Value, showToast],
  );

  /* Run once on mount so the panels aren't empty on arrival. */
  useEffect(() => {
    runAll();
    return () => {
      p9Ctrl.current?.abort();
      p6Ctrl.current?.abort();
      p7Ctrl.current?.abort();
      if (p9Debounce.current) clearTimeout(p9Debounce.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.lab}>
      {/* Hero */}
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Interactive three-model workspace</span>
          <h1 className={styles.heroTitle}>
            See what each model adds to the search journey.
          </h1>
          <p className={styles.heroDesc}>
            Try each stage on its own, or run one query through all three. Every
            result shows live response time and the evidence behind each decision.
          </p>
        </div>
        <button
          className={styles.runAllBtn}
          type="button"
          onClick={runAll}
          disabled={runningAll}
        >
          <span>{runningAll ? "Running all models…" : "Run all models"}</span>
          <small>uses the inputs below</small>
        </button>
      </section>

      {/* Journey */}
      <section className={styles.journey} aria-label="Model journey">
        <div className={styles.journeyStep}>
          <b className={styles.journeyBadge}>1</b>
          <span>
            <strong>P9</strong> Predict while typing
          </span>
        </div>
        <i className={styles.journeyArrow}>→</i>
        <div className={styles.journeyStep}>
          <b className={styles.journeyBadge}>2</b>
          <span>
            <strong>P6</strong> Understand the request
          </span>
        </div>
        <i className={styles.journeyArrow}>→</i>
        <div className={styles.journeyStep}>
          <b className={styles.journeyBadge}>3</b>
          <span>
            <strong>P7</strong> Rank matching places
          </span>
        </div>
      </section>

      {/* Three model panels */}
      <section className={styles.grid}>
        {/* P9 */}
        <article className={`${styles.panel} ${styles.p9}`}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadMain}>
              <span className={styles.modelId}>P9</span>
              <h2 className={styles.panelTitle}>Autocomplete</h2>
            </div>
            <span className={`${styles.state} ${styles[p9State]}`}>
              {STATE_LABEL[p9State]}
            </span>
          </div>
          <p className={styles.panelDesc}>
            Enter a partial phrase. Suggestions update as you type; pick one to
            send it to P6 and P7.
          </p>
          <label className={styles.fieldLabel} htmlFor="p9Input">
            Typed prefix
          </label>
          <div className={styles.fieldRow}>
            <input
              id="p9Input"
              className={styles.input}
              value={p9Input}
              onChange={(e) => onP9Change(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button className={styles.runBtn} type="button" onClick={runP9}>
              Run
            </button>
          </div>
          <div className={styles.quickTests}>
            {P9_TESTS.map((t) => (
              <button key={t} type="button" onClick={() => setP9Test(t)}>
                {t}
              </button>
            ))}
          </div>
          <div className={styles.meta}>{p9Meta}</div>
          <div className={styles.output}>
            {!p9Sug ? (
              <Empty icon="⌨" title="Start typing" sub="Suggestions appear here" />
            ) : p9Sug.length === 0 ? (
              <Empty icon="∅" title="No suggestions" sub="Try a longer prefix" />
            ) : (
              p9Sug.map((item, i) => (
                <button
                  key={`${item.text}-${i}`}
                  className={styles.sugRow}
                  type="button"
                  onClick={() => sendToDownstream(item.display || item.text)}
                >
                  <span className={styles.sugRank}>{i + 1}</span>
                  <span className={styles.sugCopy}>
                    <b>{item.display || item.text}</b>
                    <small>
                      {item.type}
                      {item.source ? ` · ${item.source}` : ""}
                    </small>
                  </span>
                  <span className={styles.sugScore}>
                    {Number(item.score).toFixed(2)}
                  </span>
                  <span className={styles.sendArrow}>→</span>
                </button>
              ))
            )}
          </div>
        </article>

        {/* P6 */}
        <article className={`${styles.panel} ${styles.p6}`}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadMain}>
              <span className={styles.modelId}>P6</span>
              <h2 className={styles.panelTitle}>Query understanding</h2>
            </div>
            <span className={`${styles.state} ${styles[p6State]}`}>
              {STATE_LABEL[p6State]}
            </span>
          </div>
          <p className={styles.panelDesc}>
            See how noisy Vietnamese text becomes a normalized query, an intent,
            and structured entities.
          </p>
          <label className={styles.fieldLabel} htmlFor="p6Input">
            User query
          </label>
          <div className={styles.fieldRow}>
            <input
              id="p6Input"
              className={styles.input}
              value={p6Input}
              onChange={(e) => setP6Value(e.target.value, false)}
              onKeyDown={(e) => e.key === "Enter" && runP6()}
              autoComplete="off"
              spellCheck={false}
            />
            <button className={styles.runBtn} type="button" onClick={runP6}>
              Run
            </button>
          </div>
          <div className={styles.quickTests}>
            {P6_TESTS.map((t) => (
              <button key={t} type="button" onClick={() => setP6Value(t, true)}>
                {t}
              </button>
            ))}
          </div>
          <div className={styles.meta}>{p6Meta}</div>
          <div className={styles.output}>
            {!p6Res ? (
              <Empty icon="◎" title="No analysis yet" sub="Run P6 to inspect it" />
            ) : (
              <>
                <div className={styles.kvRow}>
                  <span>Detected intent</span>
                  <b>{p6Res.intent}</b>
                </div>
                <div className={styles.normRow}>
                  <span>Normalized query</span>
                  <strong>{p6Res.normalized_query}</strong>
                </div>
                <div className={styles.confHead}>
                  <span>Confidence</span>
                  <b>{pct(p6Res.confidence)}</b>
                </div>
                <div className={styles.confTrack}>
                  <i style={{ width: pct(p6Res.confidence) }} />
                </div>
                <div className={styles.entityTitle}>Extracted entities</div>
                <div className={styles.entityList}>
                  {Object.entries(p6Res.entities || {}).length === 0 ? (
                    <span className={styles.noEntities}>
                      No structured entities found
                    </span>
                  ) : (
                    Object.entries(p6Res.entities).map(([k, v]) => (
                      <span key={k} className={styles.entityChip}>
                        <small>{k}</small>
                        {formatEntity(v)}
                      </span>
                    ))
                  )}
                </div>
                <details className={styles.jsonDetails}>
                  <summary>View raw response</summary>
                  <pre className={styles.jsonPre}>
                    {JSON.stringify(p6Res, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        </article>

        {/* P7 */}
        <article className={`${styles.panel} ${styles.p7}`}>
          <div className={styles.panelHead}>
            <div className={styles.panelHeadMain}>
              <span className={styles.modelId}>P7</span>
              <h2 className={styles.panelTitle}>Semantic ranking</h2>
            </div>
            <span className={`${styles.state} ${styles[p7State]}`}>
              {STATE_LABEL[p7State]}
            </span>
          </div>
          <p className={styles.panelDesc}>
            Search by need, not just by name. Inspect the ranked places and why
            each one matched.
          </p>
          <label className={styles.fieldLabel} htmlFor="p7Input">
            Search need
          </label>
          <div className={styles.fieldRow}>
            <input
              id="p7Input"
              className={styles.input}
              value={p7Input}
              onChange={(e) => setP7Value(e.target.value, false)}
              onKeyDown={(e) => e.key === "Enter" && runP7()}
              autoComplete="off"
              spellCheck={false}
            />
            <button className={styles.runBtn} type="button" onClick={runP7}>
              Run
            </button>
          </div>
          <div className={styles.quickTests}>
            {P7_TESTS.map((t) => (
              <button key={t} type="button" onClick={() => setP7Value(t, true)}>
                {t}
              </button>
            ))}
          </div>
          <div className={styles.meta}>{p7Meta}</div>
          <div className={styles.output}>
            {!p7Res ? (
              <Empty icon="≋" title="No ranking yet" sub="Run P7 to see matches" />
            ) : !p7Res.results || p7Res.results.length === 0 ? (
              <Empty icon="∅" title="No matching places" sub="Relax the constraints" />
            ) : (
              p7Res.results.map((item, i) => {
                const signals = Object.entries(item.signals || {})
                  .filter(([, v]) => Number(v) > 0)
                  .sort((a, b) => Number(b[1]) - Number(a[1]))
                  .slice(0, 3);
                return (
                  <div key={item.poi_id} className={styles.rankRow}>
                    <div className={styles.rankTop}>
                      <span className={styles.rankNum}>{i + 1}</span>
                      <div>
                        <b>{item.display_name || item.name}</b>
                        <small>
                          {item.category} · {item.district || item.city || "Vietnam"}
                          {item.address ? ` · ${item.address}` : ""}
                          {item.rating ? ` · ★ ${item.rating}` : ""}
                        </small>
                      </div>
                      <strong className={styles.rankScore}>
                        {Number(item.score).toFixed(2)}
                      </strong>
                    </div>
                    <div className={styles.scoreTrack}>
                      <i
                        style={{
                          width: `${Math.max(4, Math.min(100, Number(item.score) * 100))}%`,
                        }}
                      />
                    </div>
                    {item.reasons?.length > 0 && (
                      <div className={styles.whyList}>
                        {(p7Res.excluded_attributes ?? []).map((a) => (
                          <span key={`exc-${a}`} className={styles.excludedChip}>
                            excluded: {a}
                          </span>
                        ))}
                        {item.reasons.map((r, ri) => (
                          <span key={ri} className={styles.whyChip}>
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {signals.length > 0 && (
                      <div className={styles.signalList}>
                        {signals.map(([k, v]) => (
                          <span key={k} className={styles.signalChip}>
                            {k} <b>{Number(v).toFixed(2)}</b>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>

      {/* Evidence scorecard */}
      <section className={styles.evidence}>
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>Measured evidence</span>
            <h2 className={styles.evidenceTitle}>Semantic quality scorecard</h2>
          </div>
          <span className={styles.datasetNote}>
            Corpus-derived regression sample · E5 and TF-IDF frozen gates
          </span>
        </div>
        <div className={styles.evidenceLayout}>
          <div className={styles.tableWrap}>
            <table className={styles.accuracyTable}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Evidence</th>
                  <th>Cases</th>
                  <th>Result</th>
                  <th>Gate</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["P6", "Intent / slot fidelity", "84 sampled", "96.4% / 99.7%"],
                  ["P7", "E5 clean / perturbed constraints", "91 each", "97.8% / 80.2%"],
                  ["P7", "Reference address / OOD", "106 / 10", "100% / 100%"],
                  ["P9", "Semantic completion success@6", "147 prefixes", "95.9%"],
                  ["P9", "Accentless / typo retention", "40 each", "99.7% / 69.6%"],
                  ["P9", "Deterministic / bounded / unique", "24 runtime", "100%"],
                ].map((row, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        className={`${styles.tableModel} ${styles[`tm${row[0]}` as keyof typeof styles]}`}
                      >
                        {row[0]}
                      </span>
                    </td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>
                      <b>{row[3]}</b>
                    </td>
                    <td className={styles.gatePass}>PASS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className={styles.integrityCard}>
            <div className={styles.integrityTitle}>
              <span>✓</span>
              <b>Independent semantic judge</b>
            </div>
            <p>
              The primary score uses a deterministic corpus-derived regression
              sample and an accent-safe metadata judge — not P6, embeddings, or
              public expected strings.
            </p>
            <div className={styles.integrityStat}>
              <span>Exact target MRR (diagnostic only)</span>
              <strong>0.291</strong>
            </div>
            <div className={styles.integrityStat}>
              <span>Executable public-answer literals in runtime</span>
              <strong>0 / 96</strong>
            </div>
            <p className={styles.integrityFoot}>
              Both E5 and TF-IDF must pass frozen semantic, Vietnamese, OOD,
              concurrency, and regression checks.
            </p>
          </aside>
        </div>
        <div className={styles.tradeoffRow}>
          <div className={styles.tradeoffCard}>
            <span className={styles.tradeoffLabel}>P6 deterministic</span>
            <b>≈3.6 ms</b>
            <small>p50 · regression sample</small>
          </div>
          <div className={styles.tradeoffCard}>
            <span className={styles.tradeoffLabel}>P7 TF-IDF</span>
            <b>≈7.1 ms</b>
            <small>p50 · offline fallback</small>
          </div>
          <div className={`${styles.tradeoffCard} ${styles.tradeoffRecommended}`}>
            <span className={styles.tradeoffLabel}>
              P7 E5 <i>quality choice</i>
            </span>
            <b>≈13.9 ms</b>
            <small>p50 · stronger ranking</small>
          </div>
          <div className={styles.tradeoffCard}>
            <span className={styles.tradeoffLabel}>P9 hybrid</span>
            <b>≈5.6 ms</b>
            <small>p50 · corpus-derived</small>
          </div>
        </div>
      </section>

      <div className={`${styles.toast} ${toast ? styles.toastShow : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>{icon}</span>
      <b>{title}</b>
      <small>{sub}</small>
    </div>
  );
}
