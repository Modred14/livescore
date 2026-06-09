// src/lib/auth.js

/**
 * Authentication utilities.
 *
 * Responsibilities:
 *  - Password hashing / verification (bcrypt)
 *  - JWT creation / verification
 *  - HTTP-only cookie management
 *  - Session user retrieval from a request
 *
 * All functions that touch Node.js APIs (bcrypt, jose) are SERVER-ONLY.
 * Never import this file in Client Components.
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ── Config ────────────────────────────────────────────────────────────────────

const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error('[auth] JWT_SECRET env variable is not set.');
}

/** Encoded secret used by jose */
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

const COOKIE_NAME    = process.env.COOKIE_NAME    || 'tl_session';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** How long the cookie lives in seconds (default 7 days) */
const COOKIE_MAX_AGE = parseDuration(JWT_EXPIRES_IN);

// ── Password helpers ──────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * @param {string} plain
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plain-text password against a bcrypt hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

/**
 * Sign a JWT containing the user's session payload.
 * @param {{ id: string, email: string, full_name: string, role: string }} payload
 * @returns {Promise<string>} signed JWT string
 */
export async function signToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setSubject(payload.id)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT string.
 * Returns the payload or null if invalid / expired.
 * @param {string} token
 * @returns {Promise<Object|null>}
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

/**
 * Write the session cookie on an outgoing response.
 * Call from API route handlers.
 * @param {import('next/server').NextResponse} response
 * @param {string} token
 * @param {boolean} rememberMe  — if false, cookie expires with browser session
 */
export function setSessionCookie(response, token, rememberMe = true) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    ...(rememberMe ? { maxAge: COOKIE_MAX_AGE } : {}),
  });
}

/**
 * Clear the session cookie on an outgoing response.
 * @param {import('next/server').NextResponse} response
 */
export function clearSessionCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   0,
  });
}

/**
 * Read the session token from the incoming request cookies.
 * Works in Server Components, API routes, and middleware.
 * @param {Request} [req]  — pass the raw Request in middleware/API routes.
 *                           Omit to use next/headers (Server Components only).
 * @returns {string|null}
 */
export function getTokenFromRequest(req) {
  if (req) {
    // Used in middleware and Route Handlers
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    return match ? match.slice(COOKIE_NAME.length + 1) : null;
  }

  // Server Component path (next/headers)
  try {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

// ── Session retrieval ─────────────────────────────────────────────────────────

/**
 * Get the authenticated session payload from a request.
 * Returns null if no valid session exists.
 *
 * Usage in API Route Handlers:
 *   const session = await getSession(request);
 *   if (!session) return unauthorized();
 *
 * Usage in Server Components (no arg):
 *   const session = await getSession();
 *
 * @param {Request} [req]
 * @returns {Promise<{id:string, email:string, full_name:string, role:string}|null>}
 */
export async function getSession(req) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

// ── Standard API response helpers ────────────────────────────────────────────

/** 401 Unauthorized JSON response */
export function unauthorized(message = 'Authentication required.') {
  return Response.json({ success: false, message }, { status: 401 });
}

/** 403 Forbidden JSON response */
export function forbidden(message = 'You do not have permission to do this.') {
  return Response.json({ success: false, message }, { status: 403 });
}

// ── Internal utils ────────────────────────────────────────────────────────────

/**
 * Parse a duration string like "7d", "24h", "60m" into seconds.
 * @param {string} str
 * @returns {number}
 */
function parseDuration(str) {
  const map = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  const match = String(str).match(/^(\d+)([smhdw])$/);
  if (!match) return 7 * 86400; // default 7 days
  return parseInt(match[1], 10) * (map[match[2]] || 86400);
}