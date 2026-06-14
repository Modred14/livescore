-- src/data/migrations/005_create_match_events.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 6 Migration: Match Events table
-- Run AFTER 004_create_matches.sql
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS match_events (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID         NOT NULL REFERENCES matches(id)  ON DELETE CASCADE,
  team_id     UUID                     REFERENCES teams(id)  ON DELETE SET NULL,
  player_id   UUID                     REFERENCES players(id) ON DELETE SET NULL,

  event_type  VARCHAR(30)  NOT NULL,
  minute      SMALLINT     NOT NULL CHECK (minute >= 0 AND minute <= 130),
  extra_time  SMALLINT     NOT NULL DEFAULT 0 CHECK (extra_time >= 0 AND extra_time <= 30),

  -- Optional second player (used for substitutions: player going off)
  secondary_player_id UUID         REFERENCES players(id) ON DELETE SET NULL,

  -- Optional note (e.g. "penalty awarded after VAR review")
  note        TEXT,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT match_events_valid_type CHECK (
    event_type IN (
      'goal', 'own_goal', 'penalty_goal', 'penalty_missed',
      'yellow_card', 'red_card', 'yellow_red_card',
      'substitution',
      'kick_off', 'half_time', 'second_half', 'full_time'
    )
  )
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS match_events_match_id_idx   ON match_events (match_id);
CREATE INDEX IF NOT EXISTS match_events_type_idx       ON match_events (match_id, event_type);
CREATE INDEX IF NOT EXISTS match_events_minute_idx     ON match_events (match_id, minute, extra_time);
CREATE INDEX IF NOT EXISTS match_events_player_idx     ON match_events (player_id) WHERE player_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS match_events_team_idx       ON match_events (team_id)   WHERE team_id   IS NOT NULL;

-- ── No updated_at trigger needed (events are immutable once created) ────────

-- ── Phase 7 note ─────────────────────────────────────────────────────────────
-- Standings calculation (Phase 7) will query:
--   SELECT match_id, team_id, event_type, COUNT(*)
--   FROM match_events
--   WHERE event_type IN ('goal','own_goal','penalty_goal')
--   GROUP BY match_id, team_id, event_type
-- to verify score integrity and compute goal-scorers leaderboards.

-- ── Verification ──────────────────────────────────────────────────────────────
-- SELECT
--   me.minute, me.extra_time, me.event_type,
--   p.full_name AS player, t.name AS team
-- FROM match_events me
-- LEFT JOIN players p ON p.id = me.player_id
-- LEFT JOIN teams   t ON t.id = me.team_id
-- WHERE me.match_id = '<uuid>'
-- ORDER BY me.minute ASC, me.extra_time ASC, me.created_at ASC;