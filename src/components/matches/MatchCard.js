// src/app/api/tournaments/[id]/matches/route.js

/**
 * GET  /api/tournaments/:id/matches  — list matches (with filters)
 * POST /api/tournaments/:id/matches  — create a match (owner only)
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import { getTournamentById }                     from '@/services/tournamentService';
import {
  getMatchesByTournament,
  createMatch,
  teamsInTournament,
} from '@/services/matchService';

const VALID_STATUSES = ['scheduled','live','half_time','completed','postponed','cancelled'];

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const matches = await getMatchesByTournament(params.id, {
      status:     searchParams.get('status')     || undefined,
      round_name: searchParams.get('round_name') || undefined,
      search:     searchParams.get('search')     || undefined,
      date_from:  searchParams.get('date_from')  || undefined,
      date_to:    searchParams.get('date_to')    || undefined,
    });

    return NextResponse.json({ success: true, matches }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments/:id/matches]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch matches.' }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found.' }, { status: 404 });
    }
    if (tournament.owner_id !== session.id) {
      return forbidden('Only the tournament owner can create matches.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    // ── Validate ─────────────────────────────────────────────────────────────
    const errors = validateMatchBody(body);
    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // ── Both teams must belong to this tournament ─────────────────────────────
    const validTeams = await teamsInTournament(params.id, body.home_team_id, body.away_team_id);
    if (!validTeams) {
      return NextResponse.json({
        success: false,
        message: 'Both teams must belong to this tournament.',
        errors: { home_team_id: 'Invalid team selection.' },
      }, { status: 422 });
    }

    const match = await createMatch(params.id, {
      home_team_id: body.home_team_id,
      away_team_id: body.away_team_id,
      venue:        body.venue?.trim()      || null,
      match_date:   body.match_date,
      match_time:   body.match_time,
      round_name:   body.round_name?.trim() || null,
      status:       body.status             || 'scheduled',
    });

    return NextResponse.json({ success: true, message: 'Match created successfully.', match }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tournaments/:id/matches]', error);
    return NextResponse.json({ success: false, message: 'Failed to create match.' }, { status: 500 });
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateMatchBody(body) {
  const errors = {};
  const { home_team_id, away_team_id, match_date, match_time, status } = body || {};

  if (!home_team_id)              errors.home_team_id = 'Home team is required.';
  if (!away_team_id)              errors.away_team_id = 'Away team is required.';
  if (home_team_id && away_team_id && home_team_id === away_team_id)
    errors.away_team_id = 'Home and away teams must be different.';
  if (!match_date)                errors.match_date   = 'Match date is required.';
  if (!match_time)                errors.match_time   = 'Match time is required.';
  if (status && !VALID_STATUSES.includes(status)) errors.status = 'Invalid status.';

  return errors;
}