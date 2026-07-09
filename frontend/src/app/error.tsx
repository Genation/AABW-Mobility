"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Root error boundary — catches unhandled errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8)",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "420px",
      }}>
        <AlertCircle size={48} style={{ color: "var(--color-error)", marginBottom: "var(--space-4)" }} />
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 800, marginBottom: "var(--space-2)" }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-6)", fontSize: "var(--text-sm)" }}>
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
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
          Try again
        </button>
      </div>
    </div>
  );
}
