// src/services/teamService.js

/**
 * Team service — all PostgreSQL queries for team CRUD.
 * All functions are server-side only.
 */

import { query } from '@/lib/db';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createTeam(tournamentId, data) {
  const { name, logo_url = null, coach_name = null } = data;

  const { rows } = await query(
    `INSERT INTO teams (tournament_id, name, logo_url, coach_name, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [tournamentId, name.trim(), logo_url, coach_name?.trim() || null]
  );
  return rows[0];
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Get all teams for a tournament, with player counts.
 */
export async function getTeamsByTournament(tournamentId, { search } = {}) {
  const conditions = ['t.tournament_id = $1'];
  const values     = [tournamentId];
  let   idx        = 2;

  if (search) {
    conditions.push(`t.name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  const { rows } = await query(
    `SELECT
       t.*,
       COUNT(p.id)::int AS player_count
     FROM teams t
     LEFT JOIN players p ON p.team_id = t.id
     WHERE ${conditions.join(' AND ')}
     GROUP BY t.id
     ORDER BY t.name ASC`,
    values
  );
  return rows;
}

/**
 * Get a single team by ID, including tournament info and player count.
 */
export async function getTeamById(teamId) {
  const { rows } = await query(
    `SELECT
       t.*,
       tr.name         AS tournament_name,
       tr.owner_id     AS tournament_owner_id,
       tr.status       AS tournament_status,
       COUNT(p.id)::int AS player_count
     FROM teams t
     JOIN tournaments tr ON tr.id = t.tournament_id
     LEFT JOIN players p ON p.team_id = t.id
     WHERE t.id = $1
     GROUP BY t.id, tr.id
     LIMIT 1`,
    [teamId]
  );
  return rows[0] ?? null;
}

/**
 * Check if a team name is already taken within a tournament (excluding a specific teamId for edits).
 */
export async function isTeamNameTaken(tournamentId, name, excludeTeamId = null) {
  let sql    = `SELECT 1 FROM teams WHERE tournament_id = $1 AND LOWER(name) = LOWER($2)`;
  const vals = [tournamentId, name.trim()];
  if (excludeTeamId) {
    sql += ` AND id != $3`;
    vals.push(excludeTeamId);
  }
  sql += ' LIMIT 1';
  const { rows } = await query(sql, vals);
  return rows.length > 0;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateTeam(teamId, data) {
  const allowed = ['name', 'logo_url', 'coach_name'];
  const fields  = [];
  const values  = [];
  let   idx     = 1;

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key] ?? null);
    }
  }
  if (!fields.length) return null;
  values.push(teamId);

  const { rows } = await query(
    `UPDATE teams SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteTeam(teamId) {
  const { rowCount } = await query(`DELETE FROM teams WHERE id = $1`, [teamId]);
  return rowCount > 0;
}

// ── Ownership helper ──────────────────────────────────────────────────────────

/**
 * Verify a team belongs to a tournament owned by a specific user.
 * Returns the team row if authorised, null otherwise.
 */
export async function getTeamIfOwner(teamId, userId) {
  const { rows } = await query(
    `SELECT t.*
     FROM teams t
     JOIN tournaments tr ON tr.id = t.tournament_id
     WHERE t.id = $1 AND tr.owner_id = $2
     LIMIT 1`,
    [teamId, userId]
  );
  return rows[0] ?? null;
}