"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Navigation } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import styles from "./bottom-nav.module.css";

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/tracks/drivo/discovery", label: "Discovery", icon: Compass },
  { href: "/dashboard/tracks/drivo", label: "Drivo", icon: Navigation },
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
