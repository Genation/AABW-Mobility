"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AUTH, ROUTES } from "@/lib/constants";
import styles from "./login.module.css";

/**
 * Login page — glassmorphism card centered on animated gradient background.
 * Pre-fills demo credentials. Validates against hardcoded values.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState<string>(AUTH.USERNAME);
  const [password, setPassword] = useState<string>(AUTH.PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    const success = await login(username.trim(), password);

    if (success) {
      router.push(ROUTES.DASHBOARD);
    } else {
      setError("Invalid credentials. Try aabw-user / 123456");
      setLoading(false);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.logo}>AABW Mobility</h1>
          <p className={styles.subtitle}>AI Hackathon Dashboard</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Username */}
          <div className={styles.fieldGroup}>
            <label htmlFor="login-username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-username"
                type="text"
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${styles.inputPassword}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            <span className={styles.btnContent}>
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </span>
          </button>
        </form>

        {/* Footer — theme toggle */}
        <div className={styles.footer}>
          <div className={styles.themeRow}>
            <span className={styles.themeLabel}>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
