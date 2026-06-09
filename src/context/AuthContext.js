// src/context/AuthContext.js

'use client';

/**
 * AuthContext
 *
 * Provides global authentication state to the entire app.
 * Wrap the root layout with <AuthProvider> so every Client Component
 * can call useAuthContext() to access user + auth actions.
 *
 * State shape:
 *  {
 *    user:        object | null   — authenticated user or null
 *    loading:     boolean         — true while /api/auth/me is in-flight on mount
 *    initialized: boolean         — true after the first /me check completes
 *  }
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { API, ROUTES } from '@/lib/constants';

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user,        setUser]        = useState(null);
  const [loading,     setLoading]     = useState(true);   // initial /me fetch
  const [initialized, setInitialized] = useState(false);

  // ── Hydrate session on mount ────────────────────────────────────────────────
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(API.AUTH.ME, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const res = await fetch(API.AUTH.REGISTER, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      setUser(data.user);
      router.push(ROUTES.DASHBOARD);
      router.refresh(); // flush server-component cache
    }

    return data; // { success, message, errors? }
  }, [router]);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (formData, redirectTo = ROUTES.DASHBOARD) => {
    const res = await fetch(API.AUTH.LOGIN, {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      setUser(data.user);
      router.push(redirectTo);
      router.refresh();
    }

    return data;
  }, [router]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(API.AUTH.LOGOUT, {
        method:      'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      router.push(ROUTES.LOGIN);
      router.refresh();
    }
  }, [router]);

  // ── Update user in context (e.g. after profile edit) ───────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateUser,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Access auth state from any Client Component.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated, loading } = useAuthContext();
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>.');
  }
  return ctx;
}

export default AuthContext;