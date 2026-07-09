import {
  Languages,
  SpellCheck,
  Brain,
  MapPin,
  Zap,
  Globe,
} from "lucide-react";
import styles from "./feature-cards.module.css";

const FEATURES = [
  {
    icon: Languages,
    title: "Vietnamese NLP",
    description: "Full diacritic handling, abbreviation expansion (ks → khách sạn, bv → bệnh viện).",
    color: "var(--color-accent)",
  },
  {
    icon: SpellCheck,
    title: "Fuzzy Matching",
    description: "Typo-tolerant search with edit distance scoring for misspelled queries.",
    color: "var(--color-warning)",
  },
  {
    icon: Brain,
    title: "Intent Detection",
    description: "Classifies queries into categories, brands, POI, and addresses automatically.",
    color: "var(--color-primary)",
  },
  {
    icon: MapPin,
    title: "Regional Ranking",
    description: "Geo-aware boosting with lat/lng proximity scoring for local relevance.",
    color: "var(--color-success)",
  },
  {
    icon: Zap,
    title: "Sub-ms Latency",
    description: "Trie-based indexing delivers suggestions in under 1 millisecond.",
    color: "var(--color-error)",
  },
  {
    icon: Globe,
    title: "Mixed Language",
    description: "Handles English-Vietnamese mixed queries (e.g. 'coffee near Nguyễn Huệ').",
    color: "#06B6D4",
  },
];

/**
 * Feature showcase cards — highlights Track 4 capabilities.
 */
export function FeatureCards() {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Capabilities</h2>
      <div className={styles.grid}>
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className={styles.card}>
              <div
                className={styles.iconWrap}
                style={{ color: f.color, background: `${f.color}15` }}
              >
                <Icon size={20} />
              </div>
              <h3 className={styles.title}>{f.title}</h3>
              <p className={styles.desc}>{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
