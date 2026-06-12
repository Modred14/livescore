// src/services/matchService.js

/**
 * Match service — all PostgreSQL queries for match CRUD.
 * Server-side only.
 */

import { query } from '@/lib/db';

// ── Shared column list ────────────────────────────────────────────────────────
// Full match row with team names and logos joined in.
const MATCH_COLS = `
  m.id,
  m.tournament_id,
  m.home_team_id,
  m.away_team_id,
  m.venue,
  m.match_date,
  m.match_time,
  m.round_name,
  m.status,
  m.home_score,
  m.away_score,
  m.created_at,
  m.updated_at,
  ht.name      AS home_team_name,
  ht.logo_url  AS home_team_logo,
  at.name      AS away_team_name,
  at.logo_url  AS away_team_logo,
  tr.owner_id  AS tournament_owner_id,
  tr.name      AS tournament_name
`;

// ── Create ────────────────────────────────────────────────────────────────────

export async function createMatch(tournamentId, data) {
  const {
    home_team_id,
    away_team_id,
    venue       = null,
    match_date,
    match_time,
    round_name  = null,
    status      = 'scheduled',
    home_score  = 0,
    away_score  = 0,
  } = data;

  const { rows } = await query(
    `INSERT INTO matches
       (tournament_id, home_team_id, away_team_id, venue,
        match_date, match_time, round_name, status, home_score, away_score,
        created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, NOW(), NOW())
     RETURNING *`,
    [tournamentId, home_team_id, away_team_id, venue,
     match_date, match_time, round_name, status, home_score, away_score]
  );
  return rows[0];
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Get all matches for a tournament with optional filters.
 */
export async function getMatchesByTournament(tournamentId, filters = {}) {
  const { status, round_name, search, date_from, date_to } = filters;

  const conditions = ['m.tournament_id = $1'];
  const values     = [tournamentId];
  let   idx        = 2;

  if (status)     { conditions.push(`m.status = $${idx++}`);          values.push(status); }
  if (round_name) { conditions.push(`m.round_name = $${idx++}`);      values.push(round_name); }
  if (date_from)  { conditions.push(`m.match_date >= $${idx++}`);     values.push(date_from); }
  if (date_to)    { conditions.push(`m.match_date <= $${idx++}`);     values.push(date_to); }
  if (search) {
    conditions.push(`(ht.name ILIKE $${idx} OR at.name ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const { rows } = await query(
    `SELECT ${MATCH_COLS}
     FROM matches m
     JOIN teams ht        ON ht.id  = m.home_team_id
     JOIN teams at        ON at.id  = m.away_team_id
     JOIN tournaments tr  ON tr.id  = m.tournament_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY m.match_date ASC, m.match_time ASC`,
    values
  );
  return rows;
}

/**
 * Get a single match by ID, including team and tournament info.
 */
export async function getMatchById(matchId) {
  const { rows } = await query(
    `SELECT ${MATCH_COLS}
     FROM matches m
     JOIN teams ht        ON ht.id  = m.home_team_id
     JOIN teams at        ON at.id  = m.away_team_id
     JOIN tournaments tr  ON tr.id  = m.tournament_id
     WHERE m.id = $1
     LIMIT 1`,
    [matchId]
  );
  return rows[0] ?? null;
}

/**
 * Get all distinct round names for a tournament (for filter dropdowns).
 */
export async function getRoundNames(tournamentId) {
  const { rows } = await query(
    `SELECT DISTINCT round_name
     FROM matches
     WHERE tournament_id = $1 AND round_name IS NOT NULL
     ORDER BY round_name`,
    [tournamentId]
  );
  return rows.map((r) => r.round_name);
}

/**
 * Count summary: scheduled, live, completed, postponed, cancelled.
 */
export async function getMatchStatsByTournament(tournamentId) {
  const { rows } = await query(
    `SELECT
       COUNT(*)::int                                              AS total,
       COUNT(*) FILTER (WHERE status = 'scheduled')::int        AS scheduled,
       COUNT(*) FILTER (WHERE status = 'live')::int             AS live,
       COUNT(*) FILTER (WHERE status = 'half_time')::int        AS half_time,
       COUNT(*) FILTER (WHERE status = 'completed')::int        AS completed,
       COUNT(*) FILTER (WHERE status = 'postponed')::int        AS postponed,
       COUNT(*) FILTER (WHERE status = 'cancelled')::int        AS cancelled
     FROM matches
     WHERE tournament_id = $1`,
    [tournamentId]
  );
  return rows[0];
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateMatch(matchId, data) {
  const allowed = [
    'home_team_id', 'away_team_id', 'venue', 'match_date',
    'match_time', 'round_name', 'status', 'home_score', 'away_score',
  ];

  const fields = [];
  const values = [];
  let   idx    = 1;

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key] ?? null);
    }
  }
  if (!fields.length) return null;

  values.push(matchId);
  const { rows } = await query(
    `UPDATE matches SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteMatch(matchId) {
  const { rowCount } = await query(`DELETE FROM matches WHERE id = $1`, [matchId]);
  return rowCount > 0;
}

// ── Ownership + team validation ───────────────────────────────────────────────

/**
 * Verify both teams belong to the given tournament.
 */
export async function teamsInTournament(tournamentId, homeTeamId, awayTeamId) {
  const { rows } = await query(
    `SELECT id FROM teams
     WHERE tournament_id = $1 AND id = ANY($2::uuid[])`,
    [tournamentId, [homeTeamId, awayTeamId]]
  );
  return rows.length === 2;
}