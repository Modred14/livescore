-- src/data/migrations/003_create_teams_players.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 4 Migration: Teams & Players tables
-- Run AFTER 002_create_tournaments.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── teams ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID          NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name            VARCHAR(100)  NOT NULL,
  logo_url        TEXT,
  coach_name      VARCHAR(120),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Team name must be unique within a tournament
  CONSTRAINT teams_name_unique_per_tournament UNIQUE (tournament_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS teams_tournament_id_idx ON teams (tournament_id);
CREATE INDEX IF NOT EXISTS teams_name_idx          ON teams (tournament_id, name);

-- updated_at trigger
DROP TRIGGER IF EXISTS teams_set_updated_at ON teams;
CREATE TRIGGER teams_set_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── players ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id        UUID         NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  full_name      VARCHAR(120) NOT NULL,
  jersey_number  SMALLINT     NOT NULL CHECK (jersey_number BETWEEN 1 AND 99),
  position       VARCHAR(20)  NOT NULL,
  photo_url      TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- No duplicate jersey numbers within the same team
  CONSTRAINT players_jersey_unique_per_team UNIQUE (team_id, jersey_number),

  CONSTRAINT players_valid_position CHECK (
    position IN ('goalkeeper', 'defender', 'midfielder', 'forward')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS players_team_id_idx    ON players (team_id);
CREATE INDEX IF NOT EXISTS players_position_idx   ON players (team_id, position);
CREATE INDEX IF NOT EXISTS players_jersey_idx     ON players (team_id, jersey_number);

-- updated_at trigger
DROP TRIGGER IF EXISTS players_set_updated_at ON players;
CREATE TRIGGER players_set_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Verification queries ──────────────────────────────────────────────────────
-- List all teams in a tournament with player counts:
-- SELECT t.name, COUNT(p.id) AS player_count
-- FROM teams t
-- LEFT JOIN players p ON p.team_id = t.id
-- WHERE t.tournament_id = '<tournament_uuid>'
-- GROUP BY t.id, t.name
-- ORDER BY t.name;

-- List all players in a team ordered by jersey number:
-- SELECT jersey_number, full_name, position
-- FROM players
-- WHERE team_id = '<team_uuid>'
-- ORDER BY jersey_number;