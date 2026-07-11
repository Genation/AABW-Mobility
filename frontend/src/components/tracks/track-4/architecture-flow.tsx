import type { AutocompleteResponse } from "@/lib/api";
import styles from "./architecture-flow.module.css";

const STEPS = [
  { id: "input", label: "Input", desc: "Raw query" },
  { id: "normalize", label: "Normalize", desc: "Lowercase + strip accents" },
  { id: "expand", label: "Expand", desc: "Abbreviation lookup" },
  { id: "exact", label: "Trie Exact", desc: "Prefix match" },
  { id: "fuzzy", label: "Trie Fuzzy", desc: "Edit distance ≤ 2" },
  { id: "embedding", label: "Embedding", desc: "Semantic vector search" },
  { id: "popular", label: "Popular", desc: "Trending fallback" },
];

/** Map source to the highlighted step index */
function activeStepIndex(source: AutocompleteResponse["source"] | null): number {
  switch (source) {
    case "exact": return 3;
    case "fuzzy": return 4;
    case "embedding": return 5;
    case "popular": return 6;
    default: return -1;
  }
}

interface ArchitectureFlowProps {
  source: AutocompleteResponse["source"] | null;
}

/**
 * CSS-only architecture flow diagram — highlights the matching step.
 */
export function ArchitectureFlow({ source }: ArchitectureFlowProps) {
  const activeIdx = activeStepIndex(source);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Pipeline Architecture</h2>
      <div className={styles.flow}>
        {STEPS.map((step, i) => (
          <div key={step.id} className={styles.stepGroup}>
            <div
              className={`${styles.step} ${i === activeIdx ? styles.active : ""}`}
            >
              <span className={styles.stepLabel}>{step.label}</span>
              <span className={styles.stepDesc}>{step.desc}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`${styles.arrow} ${
                  i < activeIdx ? styles.arrowActive : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
