"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Dashboard error boundary — catches errors in dashboard routes.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "50vh",
      gap: "var(--space-4)",
      textAlign: "center",
      padding: "var(--space-8)",
    }}>
      <AlertCircle size={40} style={{ color: "var(--color-error)" }} />
      <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>
        Dashboard Error
      </h2>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", maxWidth: "400px" }}>
        {error.message || "Failed to load dashboard content."}
      </p>
      <button
        onClick={reset}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-3) var(--space-5)",
          background: "var(--color-primary)",
          color: "#ffffff",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          fontSize: "var(--text-sm)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <RefreshCw size={16} />
        Retry
      </button>
    </div>
  );
}
