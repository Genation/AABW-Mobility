import { Search } from "lucide-react";
import { allTags } from "../mock-data";
import styles from "../post-trip.module.css";

interface Props {
  query: string;
  activeTags: string[];
  onQueryChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
}

export function SearchBar({
  query,
  activeTags,
  onQueryChange,
  onTagToggle,
}: Props) {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tìm chuyến đi..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className={styles.tagFilters}>
        {allTags.map((tag) => {
          const isActive = activeTags.includes(tag);
          return (
            <button
              key={tag}
              className={[
                styles.tagChip,
                isActive ? styles.tagChipActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onTagToggle(tag)}
              type="button"
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
