// src/app/api/auth/login/route.js

/**
 * POST /api/auth/login
 *
 * Body: { email, password, remember_me? }
 *
 * Looks up the user, verifies the bcrypt password,
 * signs a JWT, sets an HTTP-only session cookie,
 * and returns the safe user object.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';
import { validateLogin, sanitizeEmail } from '@/lib/validations';

export async function POST(request) {
  try {
    // ── Parse body ────────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    const { valid, errors } = validateLogin(body);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed.', errors },
        { status: 422 }
      );
    }

    const email      = sanitizeEmail(body.email);
    const { password, remember_me = true } = body;

    // ── Fetch user ────────────────────────────────────────────────────────────
    const { rows } = await query(
      `SELECT id, full_name, email, password_hash, role, avatar_url, is_active
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    // ── Generic "invalid credentials" — don't reveal whether email exists ─────
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
          errors: { email: 'Invalid email or password.' },
        },
        { status: 401 }
      );
    }

    // ── Account active check ──────────────────────────────────────────────────
    if (!user.is_active) {
      return NextResponse.json(
        { success: false, message: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // ── Password verification ─────────────────────────────────────────────────
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password.',
          errors: { email: 'Invalid email or password.' },
        },
        { status: 401 }
      );
    }

    // ── Update last_login_at ──────────────────────────────────────────────────
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // ── Sign JWT ──────────────────────────────────────────────────────────────
    const token = await signToken({
      id:        user.id,
      email:     user.email,
      full_name: user.full_name,
      role:      user.role,
    });

    // ── Build response ────────────────────────────────────────────────────────
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logged in successfully.',
        user: {
          id:         user.id,
          full_name:  user.full_name,
          email:      user.email,
          role:       user.role,
          avatar_url: user.avatar_url,
        },
      },
      { status: 200 }
    );

    setSessionCookie(response, token, remember_me);
    return response;

  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}