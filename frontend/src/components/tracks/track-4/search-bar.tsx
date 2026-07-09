"use client";

import { Search, X } from "lucide-react";
import styles from "./search-bar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

/**
 * Hero search input with animated gradient border and loading indicator.
 */
export function SearchBar({ value, onChange, isLoading }: SearchBarProps) {
  return (
    <div className={`${styles.wrapper} ${isLoading ? styles.loading : ""}`}>
      <div className={styles.inputGroup}>
        <Search size={20} className={styles.searchIcon} />
        <input
          id="autocomplete-input"
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search places, brands, categories..."
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            className={styles.clearBtn}
            onClick={() => onChange("")}
            aria-label="Clear search"
            type="button"
          >
            <X size={16} />
          </button>
        )}
        {isLoading && <div className={styles.spinner} />}
      </div>
    </div>
  );
}
