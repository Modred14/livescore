// src/middleware.js

/**
 * Next.js Edge Middleware — runs before every matched request.
 *
 * Rules:
 *  1. PROTECTED routes → redirect to /login if no valid session.
 *  2. AUTH routes (/login, /register) → redirect to /dashboard if already logged in.
 *  3. Everything else → pass through.
 *
 * The token is verified using jose (Edge-compatible JWT library).
 * bcrypt and pg are NOT available here — verification only.
 */

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ── Configuration ─────────────────────────────────────────────────────────────

const COOKIE_NAME = process.env.COOKIE_NAME || 'tl_session';
const JWT_SECRET  = new TextEncoder().encode(process.env.JWT_SECRET || '');

/**
 * Routes that require an authenticated session.
 * Any pathname that starts with one of these prefixes is protected.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/tournaments',
  '/teams',
  '/players',
  '/matches',
  '/standings',
  '/bracket',
  '/settings',
];

/**
 * Routes that should redirect authenticated users away (e.g. back to dashboard).
 */
const AUTH_ROUTES = ['/login', '/register'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthRoute(pathname) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

async function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  const token = match.slice(COOKIE_NAME.length + 1);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ── Middleware handler ────────────────────────────────────────────────────────

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  // ── Authenticated user trying to access /login or /register ──
  if (session && isAuthRoute(pathname)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // ── Unauthenticated user trying to access a protected route ──
  if (!session && isProtected(pathname)) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};