// src/app/api/auth/me/route.js

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user's profile from the database.
 * Used by AuthContext on mount to hydrate the session.
 *
 * Returns 401 if no valid session cookie is present.
 */

import { NextResponse } from 'next/server';
import { getSession, unauthorized } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // ── Verify session ────────────────────────────────────────────────────────
    const session = await getSession(request);
    if (!session) {
      return unauthorized();
    }

    // ── Fetch fresh user from DB ──────────────────────────────────────────────
    // We re-query instead of trusting the JWT payload alone so that
    // account changes (role change, deactivation) are reflected immediately.
    const { rows } = await query(
      `SELECT id, full_name, email, role, avatar_url, last_login_at, created_at
       FROM users
       WHERE id = $1 AND is_active = TRUE
       LIMIT 1`,
      [session.id]
    );

    const user = rows[0];

    if (!user) {
      // User was deleted or deactivated since JWT was issued
      return unauthorized('Account not found or has been deactivated.');
    }

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );

  } catch (error) {
    console.error('[GET /api/auth/me]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve user.' },
      { status: 500 }
    );
  }
}