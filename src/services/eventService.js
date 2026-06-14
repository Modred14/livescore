// src/services/eventService.js

/**
 * Event service — all PostgreSQL queries for match events and live score control.
 * Server-side only.
 */

import { query } from '@/lib/db';

// ── Shared column list ────────────────────────────────────────────────────────
const EVENT_COLS = `
  me.id,
  me.match_id,
  me.team_id,
  me.player_id,
  me.secondary_player_id,
  me.event_type,
  me.minute,
  me.extra_time,
  me.note,
  me.created_at,
  p.full_name      AS player_name,
  p.jersey_number  AS player_jersey,
  p.position       AS player_position,
  sp.full_name     AS secondary_player_name,
  sp.jersey_number AS secondary_player_jersey,
  t.name           AS team_name,
  t.logo_url       AS team_logo
`;

// ── Create event ──────────────────────────────────────────────────────────────

/**
 * Insert a new match event and — for scoring events — update the score atomically.
 * Uses a transaction to keep score and events in sync.
 */
export async function createEvent(matchId, data) {
  const {
    team_id              = null,
    player_id            = null,
    secondary_player_id  = null,
    event_type,
    minute,
    extra_time           = 0,
    note                 = null,
  } = data;

  const client = await import('@/lib/db').then((m) => m.getClient());
  try {
    await client.query('BEGIN');

    // Insert the event
    const { rows: [event] } = await client.query(
      `INSERT INTO match_events
         (match_id, team_id, player_id, secondary_player_id, event_type, minute, extra_time, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [matchId, team_id, player_id, secondary_player_id, event_type, minute, extra_time, note]
    );

    // Update scores for scoring events
    if (['goal', 'penalty_goal'].includes(event_type) && team_id) {
      // Determine if team_id is home or away
      await client.query(
        `UPDATE matches
         SET home_score = home_score + CASE WHEN home_team_id = $1 THEN 1 ELSE 0 END,
             away_score = away_score + CASE WHEN away_team_id = $1 THEN 1 ELSE 0 END,
             updated_at = NOW()
         WHERE id = $2`,
        [team_id, matchId]
      );
    }

    // Own goal: credit the opposing team
    if (event_type === 'own_goal' && team_id) {
      await client.query(
        `UPDATE matches
         SET home_score = home_score + CASE WHEN away_team_id = $1 THEN 1 ELSE 0 END,
             away_score = away_score + CASE WHEN home_team_id = $1 THEN 1 ELSE 0 END,
             updated_at = NOW()
         WHERE id = $2`,
        [team_id, matchId]
      );
    }

    await client.query('COMMIT');
    return event;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Get all events for a match, ordered chronologically.
 */
export async function getEventsByMatch(matchId) {
  const { rows } = await query(
    `SELECT ${EVENT_COLS}
     FROM match_events me
     LEFT JOIN players p   ON p.id  = me.player_id
     LEFT JOIN players sp  ON sp.id = me.secondary_player_id
     LEFT JOIN teams   t   ON t.id  = me.team_id
     WHERE me.match_id = $1
     ORDER BY me.minute ASC, me.extra_time ASC, me.created_at ASC`,
    [matchId]
  );
  return rows;
}

/**
 * Get a single event by ID.
 */
export async function getEventById(eventId) {
  const { rows } = await query(
    `SELECT ${EVENT_COLS}
     FROM match_events me
     LEFT JOIN players p  ON p.id  = me.player_id
     LEFT JOIN players sp ON sp.id = me.secondary_player_id
     LEFT JOIN teams   t  ON t.id  = me.team_id
     WHERE me.id = $1 LIMIT 1`,
    [eventId]
  );
  return rows[0] ?? null;
}

/**
 * Count events by type for a match — used for match stats display.
 */
export async function getMatchEventStats(matchId) {
  const { rows } = await query(
    `SELECT
       event_type,
       team_id,
       COUNT(*)::int AS count
     FROM match_events
     WHERE match_id = $1
     GROUP BY event_type, team_id`,
    [matchId]
  );
  return rows;
}

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * Update a match event. Only minute, extra_time, and note can be changed.
 * Does NOT re-calculate scores — score changes require delete + re-create.
 */
export async function updateEvent(eventId, data) {
  const fields = [];
  const values = [];
  let   idx    = 1;

  if ('minute'     in data) { fields.push(`minute = $${idx++}`);     values.push(data.minute); }
  if ('extra_time' in data) { fields.push(`extra_time = $${idx++}`); values.push(data.extra_time); }
  if ('note'       in data) { fields.push(`note = $${idx++}`);       values.push(data.note); }

  if (!fields.length) return null;
  values.push(eventId);

  const { rows } = await query(
    `UPDATE match_events SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete an event and reverse its score impact atomically.
 */
export async function deleteEvent(eventId) {
  const client = await import('@/lib/db').then((m) => m.getClient());
  try {
    await client.query('BEGIN');

    // Fetch the event first so we know what score to reverse
    const { rows: [event] } = await client.query(
      `SELECT * FROM match_events WHERE id = $1 LIMIT 1`,
      [eventId]
    );
    if (!event) { await client.query('ROLLBACK'); return false; }

    // Reverse score for goal events
    if (['goal', 'penalty_goal'].includes(event.event_type) && event.team_id) {
      await client.query(
        `UPDATE matches
         SET home_score = GREATEST(0, home_score - CASE WHEN home_team_id = $1 THEN 1 ELSE 0 END),
             away_score = GREATEST(0, away_score - CASE WHEN away_team_id = $1 THEN 1 ELSE 0 END),
             updated_at = NOW()
         WHERE id = $2`,
        [event.team_id, event.match_id]
      );
    }
    if (event.event_type === 'own_goal' && event.team_id) {
      await client.query(
        `UPDATE matches
         SET home_score = GREATEST(0, home_score - CASE WHEN away_team_id = $1 THEN 1 ELSE 0 END),
             away_score = GREATEST(0, away_score - CASE WHEN home_team_id = $1 THEN 1 ELSE 0 END),
             updated_at = NOW()
         WHERE id = $2`,
        [event.team_id, event.match_id]
      );
    }

    await client.query(`DELETE FROM match_events WHERE id = $1`, [eventId]);
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Match status transitions ──────────────────────────────────────────────────

const STATUS_TRANSITIONS = {
  scheduled: ['live'],
  live:      ['half_time', 'completed'],
  half_time: ['live', 'completed'],
  completed: [],           // terminal state
  postponed: ['scheduled'],
  cancelled: [],
};

/**
 * Transition a match to a new status and optionally insert a lifecycle event.
 * Returns the updated match row.
 */
export async function transitionMatchStatus(matchId, newStatus, ownerId) {
  const client = await import('@/lib/db').then((m) => m.getClient());
  try {
    await client.query('BEGIN');

    // Fetch current match (including owner check)
    const { rows: [match] } = await client.query(
      `SELECT m.*, tr.owner_id FROM matches m
       JOIN tournaments tr ON tr.id = m.tournament_id
       WHERE m.id = $1 LIMIT 1`,
      [matchId]
    );
    if (!match) throw new Error('Match not found.');
    if (match.owner_id !== ownerId) throw new Error('Not authorised.');

    const allowed = STATUS_TRANSITIONS[match.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition from '${match.status}' to '${newStatus}'.`);
    }

    // Update match status
    const { rows: [updated] } = await client.query(
      `UPDATE matches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [newStatus, matchId]
    );

    // Insert lifecycle event
    const lifecycleEventMap = {
      live:      { event_type: 'kick_off',    minute: 0 },
      half_time: { event_type: 'half_time',   minute: 45 },
      completed: { event_type: 'full_time',   minute: 90 },
    };
    const lifecycleEvent = lifecycleEventMap[newStatus];
    if (lifecycleEvent) {
      await client.query(
        `INSERT INTO match_events (match_id, event_type, minute, extra_time)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT DO NOTHING`,
        [matchId, lifecycleEvent.event_type, lifecycleEvent.minute]
      );
    }

    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Player validation helper ──────────────────────────────────────────────────

/**
 * Verify a player belongs to a specific team.
 */
export async function playerBelongsToTeam(playerId, teamId) {
  const { rows } = await query(
    `SELECT 1 FROM players WHERE id = $1 AND team_id = $2 LIMIT 1`,
    [playerId, teamId]
  );
  return rows.length > 0;
}

/**
 * Get all players for both teams in a match (for event form dropdowns).
 */
export async function getMatchSquads(matchId) {
  const { rows } = await query(
    `SELECT
       p.id, p.full_name, p.jersey_number, p.position, p.photo_url,
       p.team_id,
       t.name     AS team_name,
       t.logo_url AS team_logo,
       CASE WHEN m.home_team_id = p.team_id THEN 'home' ELSE 'away' END AS side
     FROM matches m
     JOIN teams t   ON t.id = p.team_id
     JOIN players p ON p.team_id = t.id
     WHERE m.id = $1
       AND (m.home_team_id = t.id OR m.away_team_id = t.id)
     ORDER BY t.id, p.jersey_number`,
    [matchId]
  );
  return rows;
}