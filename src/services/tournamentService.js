// src/services/tournamentService.js

/**
 * Tournament service — all PostgreSQL queries for tournament CRUD.
 * Called only from API route handlers (server-side).
 */

import { query } from '@/lib/db';

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Insert a new tournament and return the full row.
 */
export async function createTournament(ownerId, data) {
  const {
    name,
    description = null,
    logo_url     = null,
    tournament_type,
    location     = null,
    start_date,
    end_date,
    status       = 'draft',
  } = data;

  const { rows } = await query(
    `INSERT INTO tournaments
       (owner_id, name, description, logo_url, tournament_type,
        location, start_date, end_date, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
     RETURNING *`,
    [ownerId, name, description, logo_url, tournament_type,
     location, start_date, end_date, status]
  );
  return rows[0];
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Get all tournaments owned by a user, with optional filters.
 * Returns tournaments newest-first.
 */
export async function getTournamentsByOwner(ownerId, { status, tournament_type, search } = {}) {
  const conditions = ['t.owner_id = $1'];
  const values     = [ownerId];
  let   idx        = 2;

  if (status) {
    conditions.push(`t.status = $${idx++}`);
    values.push(status);
  }
  if (tournament_type) {
    conditions.push(`t.tournament_type = $${idx++}`);
    values.push(tournament_type);
  }
  if (search) {
    conditions.push(`t.name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  const where = conditions.join(' AND ');

  const { rows } = await query(
    `SELECT
       t.*,
       u.full_name  AS owner_name,
       u.email      AS owner_email,
       (SELECT COUNT(*) FROM teams   WHERE tournament_id = t.id)::int  AS team_count,
       (SELECT COUNT(*) FROM matches WHERE tournament_id = t.id)::int  AS match_count
     FROM tournaments t
     JOIN users u ON u.id = t.owner_id
     WHERE ${where}
     ORDER BY t.created_at DESC`,
    values
  );
  return rows;
}

/**
 * Get a single tournament by ID.
 * Includes owner info and aggregate counts.
 * Returns null if not found.
 */
export async function getTournamentById(id) {
  const { rows } = await query(
    `SELECT
       t.*,
       u.full_name  AS owner_name,
       u.email      AS owner_email,
       u.avatar_url AS owner_avatar,
       (SELECT COUNT(*) FROM teams   WHERE tournament_id = t.id)::int  AS team_count,
       (SELECT COUNT(*) FROM matches WHERE tournament_id = t.id)::int  AS match_count,
       (SELECT COUNT(*) FROM matches WHERE tournament_id = t.id AND status = 'completed')::int AS completed_matches,
       (SELECT COUNT(*) FROM matches WHERE tournament_id = t.id AND status = 'live')::int      AS live_matches
     FROM tournaments t
     JOIN users u ON u.id = t.owner_id
     WHERE t.id = $1
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * Update a tournament. Only the provided fields are changed.
 * Verifies ownership before updating — returns null if not owner.
 */
export async function updateTournament(id, ownerId, data) {
  const allowed = [
    'name', 'description', 'logo_url', 'tournament_type',
    'location', 'start_date', 'end_date', 'status',
  ];

  const fields = [];
  const values = [];
  let   idx    = 1;

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = $${idx++}`);
      values.push(data[key]);
    }
  }

  if (fields.length === 0) return null;

  // owner_id and id go last
  values.push(id);       // $N
  values.push(ownerId);  // $N+1

  const { rows } = await query(
    `UPDATE tournaments
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} AND owner_id = $${idx + 1}
     RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a tournament. Verifies ownership.
 * Returns true if deleted, false if not found / not owner.
 */
export async function deleteTournament(id, ownerId) {
  const { rowCount } = await query(
    `DELETE FROM tournaments WHERE id = $1 AND owner_id = $2`,
    [id, ownerId]
  );
  return rowCount > 0;
}

// ── Ownership check ───────────────────────────────────────────────────────────

/**
 * Quick check: does this user own this tournament?
 */
export async function isOwner(tournamentId, userId) {
  const { rows } = await query(
    `SELECT 1 FROM tournaments WHERE id = $1 AND owner_id = $2 LIMIT 1`,
    [tournamentId, userId]
  );
  return rows.length > 0;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

/**
 * Aggregate stats for the dashboard — counts per status for a given owner.
 */
export async function getTournamentStatsByOwner(ownerId) {
  const { rows } = await query(
    `SELECT
       COUNT(*)                                          ::int AS total,
       COUNT(*) FILTER (WHERE status = 'active')        ::int AS active,
       COUNT(*) FILTER (WHERE status = 'upcoming')      ::int AS upcoming,
       COUNT(*) FILTER (WHERE status = 'completed')     ::int AS completed,
       COUNT(*) FILTER (WHERE status = 'draft')         ::int AS draft
     FROM tournaments
     WHERE owner_id = $1`,
    [ownerId]
  );
  return rows[0];
}