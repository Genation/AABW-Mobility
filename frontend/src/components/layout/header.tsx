"use client";

import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import styles from "./header.module.css";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const DRIVO_PATH = "/dashboard/tracks/drivo";

/**
 * Dashboard header — logo, mobile menu toggle, theme toggle, user/logout.
 */
export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isDrivo = pathname.startsWith(DRIVO_PATH);

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
        <Link href={ROUTES.DASHBOARD} className={styles.logoLink}>
          <Image
            src={isDrivo ? "/DrivoLogo.png" : "/logo.webp"}
            alt={isDrivo ? "Drivo Logo" : "Tasco Logo"}
            width={isDrivo ? 100 : 28}
            height={isDrivo ? 48 : 28}
            className={styles.logoImg}
            priority
          />
          {!isDrivo && <span className={styles.logo}>Tasco</span>}
        </Link>
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
