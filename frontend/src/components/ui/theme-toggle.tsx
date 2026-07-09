"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import styles from "./theme-toggle.module.css";

/**
 * Dark/light theme toggle button.
 * Displays Sun icon in dark mode, Moon icon in light mode.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      id="theme-toggle"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      type="button"
    >
      <span className={`${styles.icon} ${isDark ? styles.active : ""}`}>
        <Sun size={18} />
      </span>
      <span className={`${styles.icon} ${!isDark ? styles.active : ""}`}>
        <Moon size={18} />
      </span>
    </button>
  );
}
