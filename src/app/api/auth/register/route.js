// src/app/api/auth/register/route.js

/**
 * POST /api/auth/register
 *
 * Body: { full_name, email, password, confirm_password, remember_me? }
 *
 * Creates a new user, hashes the password, signs a JWT,
 * sets an HTTP-only session cookie, and returns the safe user object.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';
import { validateRegister, sanitizeEmail, sanitizeName } from '@/lib/validations';

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
    const { valid, errors } = validateRegister(body);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Validation failed.', errors },
        { status: 422 }
      );
    }

    const email    = sanitizeEmail(body.email);
    const fullName = sanitizeName(body.full_name);
    const { password, remember_me = true } = body;

    // ── Duplicate email check ─────────────────────────────────────────────────
    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [email]
    );
    if (existing.rowCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this email already exists.',
          errors: { email: 'This email is already registered.' },
        },
        { status: 409 }
      );
    }

    // ── Hash password & insert ────────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, 'manager', NOW(), NOW())
       RETURNING id, full_name, email, role, avatar_url, created_at`,
      [fullName, email, passwordHash]
    );

    const user = rows[0];

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
        message: 'Account created successfully.',
        user: {
          id:         user.id,
          full_name:  user.full_name,
          email:      user.email,
          role:       user.role,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
        },
      },
      { status: 201 }
    );

    setSessionCookie(response, token, remember_me);
    return response;

  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}