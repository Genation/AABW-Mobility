"use client";

import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import styles from "./header.module.css";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

/**
 * Dashboard header — logo, mobile menu toggle, theme toggle, user/logout.
 */
export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header} id="dashboard-header">
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          type="button"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className={styles.logo}>AABW Mobility</span>
      </div>

      <div className={styles.right}>
        <ThemeToggle />
        {user && (
          <div className={styles.userSection}>
            <span className={styles.username}>{user.username}</span>
            <button
              id="logout-btn"
              className={styles.logoutBtn}
              onClick={logout}
              title="Sign out"
              type="button"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
