"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { AUTH } from "@/lib/constants";

/* ------------------------------------------------------------------
   Types
   ------------------------------------------------------------------ */

interface User {
  username: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

/* ------------------------------------------------------------------
   External Store — sessionStorage as source of truth
   ------------------------------------------------------------------ */

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

let cachedString: string | null = null;
let cachedUser: User | null = null;

function getSnapshot(): User | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(AUTH.STORAGE_KEY);
    if (stored === cachedString) {
      return cachedUser;
    }
    
    cachedString = stored;
    cachedUser = null;

    if (stored) {
      const parsed = JSON.parse(stored) as User;
      if (parsed?.username) {
        cachedUser = parsed;
      }
    }
    return cachedUser;
  } catch {
    /* corrupted storage — ignore */
    return null;
  }
}

function getServerSnapshot(): User | null {
  return null;
}

/* ------------------------------------------------------------------
   Context
   ------------------------------------------------------------------ */

const AuthContext = createContext<AuthContextValue | null>(null);

/* ------------------------------------------------------------------
   Provider
   ------------------------------------------------------------------ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      /* Simulate async check (e.g. network delay) */
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (username === AUTH.USERNAME && password === AUTH.PASSWORD) {
        const newUser: User = { username };
        try {
          sessionStorage.setItem(AUTH.STORAGE_KEY, JSON.stringify(newUser));
        } catch {
          /* noop */
        }
        emitChange();
        return true;
      }
      return false;
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(AUTH.STORAGE_KEY);
    } catch {
      /* noop */
    }
    emitChange();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!user,
      user,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------
   Hook
   ------------------------------------------------------------------ */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
