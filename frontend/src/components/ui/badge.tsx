import styles from "./badge.module.css";

type BadgeVariant = "success" | "warning" | "info" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

/**
 * Small label badge with semantic color variants.
 */
export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}
