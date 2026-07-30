import styles from "../post-trip.module.css";

interface Props {
  tags: string[];
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
  interactive?: boolean;
}

export function TagRow({ tags, onTagClick, activeTags = [], interactive = true }: Props) {
  return (
    <div className={styles.tagRow}>
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag);
        const className = [
          styles.tagChip,
          isActive ? styles.tagChipActive : "",
        ]
          .filter(Boolean)
          .join(" ");

        if (!interactive || !onTagClick) {
          return (
            <span key={tag} className={className}>
              {tag}
            </span>
          );
        }

        return (
          <button
            key={tag}
            className={className}
            onClick={(e) => {
              e.stopPropagation();
              onTagClick(tag);
            }}
            type="button"
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
