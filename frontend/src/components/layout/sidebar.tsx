"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import styles from "./sidebar.module.css";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tracks/drivo/discovery", label: "Discovery", icon: Compass },
];

/**
 * Left sidebar — navigation links. Overlay on mobile, fixed on desktop.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`${styles.sidebar} ${open ? styles.open : ""}`}
        id="dashboard-sidebar"
      >
        <nav className={styles.nav}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Navigation</span>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                  onClick={onClose}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.footer}>
          <span className={styles.footerText}>Tasco Hackathon 2026</span>
        </div>
      </aside>
    </>
  );
}
