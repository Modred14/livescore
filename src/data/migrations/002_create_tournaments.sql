-- src/data/migrations/002_create_tournaments.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 3 Migration: Tournaments table
-- Run AFTER 001_create_users.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── tournaments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tournaments (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core identity
  name            VARCHAR(150)  NOT NULL,
  description     TEXT,
  logo_url        TEXT,

  -- Classification
  tournament_type VARCHAR(30)   NOT NULL DEFAULT 'league',
  -- Allowed values: 'league' | 'knockout' | 'group_stage' | 'round_robin'

  -- Location & schedule
  location        VARCHAR(200),
  start_date      DATE          NOT NULL,
  end_date        DATE          NOT NULL,

  -- Lifecycle
  status          VARCHAR(20)   NOT NULL DEFAULT 'draft',
  -- Allowed values: 'draft' | 'upcoming' | 'active' | 'completed'

  -- Audit
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT tournaments_end_after_start CHECK (end_date >= start_date),
  CONSTRAINT tournaments_valid_type CHECK (
    tournament_type IN ('league', 'knockout', 'group_stage', 'round_robin')
  ),
  CONSTRAINT tournaments_valid_status CHECK (
    status IN ('draft', 'upcoming', 'active', 'completed')
  )
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

-- Fetch all tournaments for a user (My Tournaments page)
CREATE INDEX IF NOT EXISTS tournaments_owner_id_idx
  ON tournaments (owner_id);

-- Filter by status
CREATE INDEX IF NOT EXISTS tournaments_status_idx
  ON tournaments (status);

-- Filter by type
CREATE INDEX IF NOT EXISTS tournaments_type_idx
  ON tournaments (tournament_type);

-- Combined owner + status (most common query pattern)
CREATE INDEX IF NOT EXISTS tournaments_owner_status_idx
  ON tournaments (owner_id, status);

-- Sort by most recently created
CREATE INDEX IF NOT EXISTS tournaments_created_at_idx
  ON tournaments (created_at DESC);

-- ── updated_at trigger ────────────────────────────────────────────────────────
-- Re-uses the function created in 001_create_users.sql
-- If running standalone, uncomment the function below:
--
-- CREATE OR REPLACE FUNCTION set_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tournaments_set_updated_at ON tournaments;
CREATE TRIGGER tournaments_set_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Future phase placeholders (referenced by later migrations) ────────────────
-- Phase 4 will add:
--   teams      (tournament_id FK → tournaments.id)
--   players    (team_id FK → teams.id)
-- Phase 5 will add:
--   matches    (tournament_id FK → tournaments.id)
--   match_events (match_id FK → matches.id)
-- Phase 6 will add:
--   standings  (tournament_id FK → tournaments.id)

-- ── Verification ──────────────────────────────────────────────────────────────
-- SELECT
--   t.id, t.name, t.status, t.tournament_type,
--   u.full_name AS owner_name
-- FROM tournaments t
-- JOIN users u ON u.id = t.owner_id
-- ORDER BY t.created_at DESC
-- LIMIT 10;