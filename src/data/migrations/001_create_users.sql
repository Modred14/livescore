-- src/data/migrations/001_create_users.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 2 Migration: Users table
-- Run this against your Neon PostgreSQL database before starting the app.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable pgcrypto for gen_random_uuid() (available on Neon by default)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash TEXT          NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'manager',  -- 'admin' | 'manager' | 'viewer'
  avatar_url    TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Unique email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
  ON users (LOWER(email));

-- Fast lookup by email on login
CREATE INDEX IF NOT EXISTS users_email_idx
  ON users (LOWER(email));

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Seed: optional admin user for local dev ───────────────────────────────────
-- Password: Admin1234!  (bcrypt hash — change before production)
-- INSERT INTO users (full_name, email, password_hash, role)
-- VALUES (
--   'Admin User',
--   'admin@tournalive.com',
--   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oRan9r3oG',
--   'admin'
-- );

-- ── Verification query ────────────────────────────────────────────────────────
-- Run this to confirm the table was created:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users'
-- ORDER BY ordinal_position;