"use client";

import { useRef, type KeyboardEvent } from "react";
import { Search, X } from "lucide-react";
import styles from "./search-bar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Ref forwarded from parent for focus management */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Hero search input with animated gradient border and loading indicator.
 * Supports focus/blur, keyboard navigation, and external ref.
 */
export function SearchBar({
  value,
  onChange,
  isLoading,
  onFocus,
  onBlur,
  onKeyDown,
  inputRef,
}: SearchBarProps) {
  const fallbackRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? fallbackRef;

  return (
    <div className={`${styles.wrapper} ${isLoading ? styles.loading : ""}`}>
      <div className={styles.inputGroup}>
        <Search size={20} className={styles.searchIcon} />
        <input
          ref={ref}
          id="autocomplete-input"
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder="Search places, brands, categories..."
          autoComplete="off"
          spellCheck={false}
        />
        {value && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              onChange("");
              ref.current?.focus();
            }}
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
