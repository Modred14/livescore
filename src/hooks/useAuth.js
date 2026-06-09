// src/hooks/useAuth.js

'use client';

/**
 * useAuth — convenience hook for consuming AuthContext.
 *
 * Re-exports useAuthContext with a friendlier name.
 * Also provides derived helpers so components don't need to
 * import both the context and derive values themselves.
 *
 * Usage:
 *   const { user, isAuthenticated, isAdmin, loading, login, logout } = useAuth();
 */

import { useAuthContext } from '@/context/AuthContext';
import { USER_ROLE } from '@/lib/constants';

export default function useAuth() {
  const ctx = useAuthContext();

  return {
    ...ctx,

    /** True if the authenticated user has the 'admin' role */
    isAdmin: ctx.user?.role === USER_ROLE.ADMIN,

    /** True if the authenticated user has the 'manager' role */
    isManager: ctx.user?.role === USER_ROLE.MANAGER,

    /** Initials derived from full_name (used in avatars) */
    initials: getInitials(ctx.user?.full_name),

    /** First name only */
    firstName: ctx.user?.full_name?.split(' ')[0] ?? '',
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}