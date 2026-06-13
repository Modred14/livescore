-- src/data/migrations/004_create_matches.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 5 Migration: Matches table
-- Run AFTER 003_create_teams_players.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS matches (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  tournament_id   UUID          NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  home_team_id    UUID          NOT NULL REFERENCES teams(id)       ON DELETE RESTRICT,
  away_team_id    UUID          NOT NULL REFERENCES teams(id)       ON DELETE RESTRICT,

  -- Scheduling
  venue           VARCHAR(200),
  match_date      DATE          NOT NULL,
  match_time      TIME          NOT NULL,
  round_name      VARCHAR(100),          -- e.g. "Matchday 3", "Quarter Final", "Group A"

  -- Lifecycle
  status          VARCHAR(20)   NOT NULL DEFAULT 'scheduled',
  -- Allowed: 'scheduled' | 'live' | 'half_time' | 'completed' | 'postponed' | 'cancelled'

  -- Scoring (used from Phase 6 onwards)
  home_score      SMALLINT      NOT NULL DEFAULT 0,
  away_score      SMALLINT      NOT NULL DEFAULT 0,

  -- Audit
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT matches_teams_differ     CHECK (home_team_id != away_team_id),
  CONSTRAINT matches_valid_status     CHECK (
    status IN ('scheduled','live','half_time','completed','postponed','cancelled')
  ),
  CONSTRAINT matches_scores_non_negative CHECK (home_score >= 0 AND away_score >= 0)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS matches_tournament_id_idx  ON matches (tournament_id);
CREATE INDEX IF NOT EXISTS matches_status_idx         ON matches (tournament_id, status);
CREATE INDEX IF NOT EXISTS matches_date_idx           ON matches (tournament_id, match_date);
CREATE INDEX IF NOT EXISTS matches_home_team_idx      ON matches (home_team_id);
CREATE INDEX IF NOT EXISTS matches_away_team_idx      ON matches (away_team_id);
CREATE INDEX IF NOT EXISTS matches_round_idx          ON matches (tournament_id, round_name);

-- ── updated_at trigger ────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS matches_set_updated_at ON matches;
CREATE TRIGGER matches_set_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Phase 6 placeholder: match_events ────────────────────────────────────────
-- The match_events table will be created in 005_create_match_events.sql.
-- It will have: id, match_id FK→matches, team_id FK→teams,
--               player_id FK→players, event_type, minute, created_at

-- ── Verification ──────────────────────────────────────────────────────────────
-- SELECT
--   m.id, m.status, m.match_date, m.match_time,
--   ht.name AS home_team, at.name AS away_team,
--   m.home_score, m.away_score, m.round_name
-- FROM matches m
-- JOIN teams ht ON ht.id = m.home_team_id
-- JOIN teams at ON at.id = m.away_team_id
-- WHERE m.tournament_id = '<uuid>'
-- ORDER BY m.match_date, m.match_time;