import Link from "next/link";
import { Home, MapPin } from "lucide-react";

/**
 * Custom 404 page — shown when a route doesn't exist.
 */
export default function NotFound() {
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
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <MapPin size={48} style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }} />
        <h1 style={{
          fontSize: "var(--text-4xl)",
          fontWeight: 800,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "var(--space-2)",
        }}>
          404
        </h1>
        <p style={{
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          marginBottom: "var(--space-2)",
        }}>
          Page Not Found
        </p>
        <p style={{
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-sm)",
          marginBottom: "var(--space-6)",
        }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-3) var(--space-6)",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            color: "#ffffff",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "var(--text-sm)",
            textDecoration: "none",
          }}
        >
          <Home size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
