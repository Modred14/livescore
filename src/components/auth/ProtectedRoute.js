// src/components/auth/ProtectedRoute.js

'use client';

/**
 * ProtectedRoute
 *
 * Client-side guard that complements the edge middleware.
 * The middleware handles the first request; this component handles
 * cases where the user's token expires mid-session without a page reload.
 *
 * Wrap any page or layout that should only be visible to authenticated users:
 *
 *   export default function DashboardPage() {
 *     return (
 *       <ProtectedRoute>
 *         <DashboardLayout>...</DashboardLayout>
 *       </ProtectedRoute>
 *     );
 *   }
 *
 * Optional `requiredRole` prop restricts access to a specific role:
 *   <ProtectedRoute requiredRole="admin">...</ProtectedRoute>
 */

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { PageSpinner } from '@/components/ui/Spinner';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, initialized } = useAuthContext();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!initialized) return; // still loading — don't redirect yet

    if (!user) {
      // Redirect to login, preserving the intended destination
      const loginUrl = `${ROUTES.LOGIN}?next=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Wrong role — redirect to dashboard
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, initialized, router, pathname, requiredRole]);

  // Show spinner while we're waiting for the /me fetch to complete
  if (loading || !initialized) {
    return <PageSpinner message="Loading your session…" />;
  }

  // Not authenticated — render nothing while redirect happens
  if (!user) {
    return <PageSpinner message="Redirecting to login…" />;
  }

  // Role mismatch
  if (requiredRole && user.role !== requiredRole) {
    return <PageSpinner message="Checking permissions…" />;
  }

  return children;
}