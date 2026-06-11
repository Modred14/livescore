// src/services/playerService.js

/**
 * Player service — all PostgreSQL queries for player CRUD.
 * All functions are server-side only.
 */

import { query } from '@/lib/db';

// ── Create ────────────────────────────────────────────────────────────────────

export async function createPlayer(teamId, data) {
  const { full_name, jersey_number, position, photo_url = null } = data;

  const { rows } = await query(
    `INSERT INTO players (team_id, full_name, jersey_number, position, photo_url, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [teamId, full_name.trim(), parseInt(jersey_number, 10), position, photo_url]
  );
  return rows[0];
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Get all players for a team, with optional filters.
 */
export async function getPlayersByTeam(teamId, { position, search } = {}) {
  const conditions = ['p.team_id = $1'];
  const values     = [teamId];
  let   idx        = 2;

  if (position) {
    conditions.push(`p.position = $${idx++}`);
    values.push(position);
  }
  if (search) {
    conditions.push(`p.full_name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  const { rows } = await query(
    `SELECT p.*,
            t.name          AS team_name,
            t.tournament_id AS tournament_id
     FROM players p
     JOIN teams t ON t.id = p.team_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.jersey_number ASC`,
    values
  );
  return rows;
}

/**
 * Get ALL players across all teams in a tournament.
 */
export async function getPlayersByTournament(tournamentId, { position, search } = {}) {
  const conditions = ['t.tournament_id = $1'];
  const values     = [tournamentId];
  let   idx        = 2;

  if (position) {
    conditions.push(`p.position = $${idx++}`);
    values.push(position);
  }
  if (search) {
    conditions.push(`p.full_name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  const { rows } = await query(
    `SELECT p.*,
            t.name          AS team_name,
            t.id            AS team_id,
            t.tournament_id AS tournament_id
     FROM players p
     JOIN teams t ON t.id = p.team_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.name ASC, p.jersey_number ASC`,
    values
  );
  return rows;
}

/**
 * Get a single player by ID.
 */
export async function getPlayerById(playerId) {
  const { rows } = await query(
    `SELECT p.*,
            t.name          AS team_name,
            t.tournament_id AS tournament_id,
            t.logo_url      AS team_logo_url,
            tr.owner_id     AS tournament_owner_id,
            tr.name         AS tournament_name
     FROM players p
     JOIN teams t       ON t.id  = p.team_id
     JOIN tournaments tr ON tr.id = t.tournament_id
     WHERE p.id = $1
     LIMIT 1`,
    [playerId]
  );
  return rows[0] ?? null;
}

/**
 * Check if a jersey number is taken within a team (excluding a player for edits).
 */
export async function isJerseyTaken(teamId, jerseyNumber, excludePlayerId = null) {
  let sql    = `SELECT 1 FROM players WHERE team_id = $1 AND jersey_number = $2`;
  const vals = [teamId, parseInt(jerseyNumber, 10)];
  if (excludePlayerId) { sql += ` AND id != $3`; vals.push(excludePlayerId); }
  sql += ' LIMIT 1';
  const { rows } = await query(sql, vals);
  return rows.length > 0;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updatePlayer(playerId, data) {
  const allowed = ['full_name', 'jersey_number', 'position', 'photo_url'];
  const fields  = [];
  const values  = [];
  let   idx     = 1;

  for (const key of allowed) {
    if (key in data) {
      const val = key === 'jersey_number' ? parseInt(data[key], 10) : (data[key] ?? null);
      fields.push(`${key} = $${idx++}`);
      values.push(val);
    }
  }
  if (!fields.length) return null;
  values.push(playerId);

  const { rows } = await query(
    `UPDATE players SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deletePlayer(playerId) {
  const { rowCount } = await query(`DELETE FROM players WHERE id = $1`, [playerId]);
  return rowCount > 0;
}

/**
 * Verify player belongs to a tournament owned by userId.
 */
export async function getPlayerIfOwner(playerId, userId) {
  const { rows } = await query(
    `SELECT p.*
     FROM players p
     JOIN teams t        ON t.id  = p.team_id
     JOIN tournaments tr ON tr.id = t.tournament_id
     WHERE p.id = $1 AND tr.owner_id = $2
     LIMIT 1`,
    [playerId, userId]
  );
  return rows[0] ?? null;
}

/**
 * Player count breakdown by position for a team.
 */
export async function getPlayerCountsByPosition(teamId) {
  const { rows } = await query(
    `SELECT position, COUNT(*)::int AS count
     FROM players WHERE team_id = $1
     GROUP BY position`,
    [teamId]
  );
  return rows;
}