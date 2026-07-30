"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ROUTES } from "@/lib/constants";
import styles from "./dashboard.module.css";

/**
 * Dashboard layout — auth guard + header + sidebar + main content area.
 * Redirects unauthenticated users to /login.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDrivoPage = pathname.startsWith("/dashboard/tracks/drivo");

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // Prevent flash while redirecting
  }

  return (
    <div className={`${styles.layout} ${isDrivoPage ? styles.drivoLayout : ""}`}>
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        hideOnMobile={isDrivoPage}
      />
      <div className={styles.body}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.main}>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
