"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Layers, Settings } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import styles from "./bottom-nav.module.css";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Home", icon: LayoutDashboard },
  { href: ROUTES.TRACK_DETAIL("track-4"), label: "Search", icon: Search },
  { href: "#tracks", label: "Tracks", icon: Layers, disabled: true },
  { href: "#settings", label: "Settings", icon: Settings, disabled: true },
];

/**
 * Bottom navigation bar — visible only on mobile (≤768px).
 * Glassmorphism style, 4 tab items with active indicator.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} id="bottom-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href.split('#')[0]));
        const Icon = item.icon;

        if (item.disabled) {
          return (
            <span key={item.label} className={styles.item} aria-disabled="true">
              <Icon size={20} />
              <span className={styles.label}>{item.label}</span>
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.item} ${isActive ? styles.active : ""}`}
          >
            <Icon size={20} />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
