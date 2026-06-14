// src/app/api/tournaments/[id]/matches/[matchId]/events/route.js

/**
 * GET  /api/tournaments/:id/matches/:matchId/events  — list all events
 * POST /api/tournaments/:id/matches/:matchId/events  — add event (owner only)
 */

import { NextResponse }                        from 'next/server';
import { getSession, unauthorized, forbidden } from '@/lib/auth';
import { getMatchById }                        from '@/services/matchService';
import {
  createEvent,
  getEventsByMatch,
  playerBelongsToTeam,
} from '@/services/eventService';

const VALID_TYPES = [
  'goal','own_goal','penalty_goal','penalty_missed',
  'yellow_card','red_card','yellow_red_card',
  'substitution',
  'kick_off','half_time','second_half','full_time',
];

const SCORING_TYPES  = new Set(['goal','penalty_goal','own_goal']);
const CARD_TYPES     = new Set(['yellow_card','red_card','yellow_red_card']);
const SUB_TYPES      = new Set(['substitution']);
const LIFECYCLE_TYPES = new Set(['kick_off','half_time','second_half','full_time']);

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }

    const events = await getEventsByMatch(params.matchId);
    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (error) {
    console.error('[GET events]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch events.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can add match events.');
    }

    // Match must be live or half_time to accept events
    if (!['live', 'half_time'].includes(match.status)) {
      return NextResponse.json({
        success: false,
        message: 'Events can only be added to live or half-time matches.',
      }, { status: 422 });
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    // ── Validate ──────────────────────────────────────────────────────────
    const errors = {};
    const { event_type, minute, extra_time = 0, team_id, player_id, secondary_player_id, note } = body || {};

    if (!event_type || !VALID_TYPES.includes(event_type)) {
      errors.event_type = `Invalid event type. Must be one of: ${VALID_TYPES.join(', ')}`;
    }

    const min = parseInt(minute, 10);
    if (minute === undefined || minute === null || minute === '') {
      errors.minute = 'Minute is required.';
    } else if (isNaN(min) || min < 0 || min > 130) {
      errors.minute = 'Minute must be between 0 and 130.';
    }

    const ext = parseInt(extra_time, 10) || 0;
    if (isNaN(ext) || ext < 0 || ext > 30) {
      errors.extra_time = 'Extra time must be between 0 and 30.';
    }

    // Events that need a team
    if ((SCORING_TYPES.has(event_type) || CARD_TYPES.has(event_type) || SUB_TYPES.has(event_type)) && !team_id) {
      errors.team_id = 'Team is required for this event type.';
    }

    // Team must belong to this match
    if (team_id && match.home_team_id !== team_id && match.away_team_id !== team_id) {
      errors.team_id = 'Team must be one of the teams in this match.';
    }

    // Events that need a player
    if ((SCORING_TYPES.has(event_type) || CARD_TYPES.has(event_type) || SUB_TYPES.has(event_type)) && !player_id) {
      errors.player_id = 'Player is required for this event type.';
    }

    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // Player must belong to the selected team
    if (player_id && team_id) {
      const valid = await playerBelongsToTeam(player_id, team_id);
      if (!valid) {
        return NextResponse.json({
          success: false,
          message: 'Player does not belong to the selected team.',
          errors: { player_id: 'Player must be in the selected team.' },
        }, { status: 422 });
      }
    }

    // Secondary player validation for substitutions
    if (SUB_TYPES.has(event_type) && secondary_player_id && team_id) {
      const valid = await playerBelongsToTeam(secondary_player_id, team_id);
      if (!valid) {
        return NextResponse.json({
          success: false,
          message: 'Secondary player does not belong to the selected team.',
          errors: { secondary_player_id: 'Player must be in the selected team.' },
        }, { status: 422 });
      }
    }

    const event = await createEvent(params.matchId, {
      team_id:             team_id             || null,
      player_id:           player_id           || null,
      secondary_player_id: secondary_player_id || null,
      event_type,
      minute:     min,
      extra_time: ext,
      note:       note?.trim() || null,
    });

    return NextResponse.json({ success: true, message: 'Event added.', event }, { status: 201 });
  } catch (error) {
    console.error('[POST events]', error);
    return NextResponse.json({ success: false, message: 'Failed to add event.' }, { status: 500 });
  }
}