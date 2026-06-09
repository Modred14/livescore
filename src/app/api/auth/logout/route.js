// src/app/api/auth/logout/route.js

/**
 * POST /api/auth/logout
 *
 * Clears the session cookie and returns a success response.
 * No body required — the cookie is cleared regardless of its validity.
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully.' },
      { status: 200 }
    );
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error('[POST /api/auth/logout]', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed.' },
      { status: 500 }
    );
  }
}