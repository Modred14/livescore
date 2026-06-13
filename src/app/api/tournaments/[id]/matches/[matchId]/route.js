// src/app/api/tournaments/[id]/matches/[matchId]/route.js

/**
 * GET    /api/tournaments/:id/matches/:matchId
 * PATCH  /api/tournaments/:id/matches/:matchId  (owner only)
 * DELETE /api/tournaments/:id/matches/:matchId  (owner only)
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import {
  getMatchById,
  updateMatch,
  deleteMatch,
  teamsInTournament,
} from '@/services/matchService';

const VALID_STATUSES = ['scheduled','live','half_time','completed','postponed','cancelled'];

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, match }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments/:id/matches/:matchId]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch match.' }, { status: 500 });
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can edit matches.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    // Validate fields present in body
    const errors = {};
    if ('home_team_id' in body && !body.home_team_id) errors.home_team_id = 'Home team is required.';
    if ('away_team_id' in body && !body.away_team_id) errors.away_team_id = 'Away team is required.';
    if ('match_date'   in body && !body.match_date)   errors.match_date   = 'Match date is required.';
    if ('match_time'   in body && !body.match_time)   errors.match_time   = 'Match time is required.';
    if ('status' in body && !VALID_STATUSES.includes(body.status)) errors.status = 'Invalid status.';

    // Same-team check
    const resolvedHome = body.home_team_id ?? match.home_team_id;
    const resolvedAway = body.away_team_id ?? match.away_team_id;
    if (resolvedHome === resolvedAway) {
      errors.away_team_id = 'Home and away teams must be different.';
    }

    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // If teams changed, verify they still belong to this tournament
    if (body.home_team_id || body.away_team_id) {
      const valid = await teamsInTournament(params.id, resolvedHome, resolvedAway);
      if (!valid) {
        return NextResponse.json({
          success: false,
          message: 'Both teams must belong to this tournament.',
        }, { status: 422 });
      }
    }

    // Build update payload
    const updates = {};
    const fields = [
      'home_team_id','away_team_id','venue','match_date',
      'match_time','round_name','status','home_score','away_score',
    ];
    for (const f of fields) {
      if (f in body) updates[f] = body[f] ?? null;
    }
    // Sanitise strings
    if ('venue'      in updates) updates.venue      = updates.venue?.trim()      || null;
    if ('round_name' in updates) updates.round_name = updates.round_name?.trim() || null;

    const updated = await updateMatch(params.matchId, updates);
    return NextResponse.json({ success: true, message: 'Match updated.', match: updated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tournaments/:id/matches/:matchId]', error);
    return NextResponse.json({ success: false, message: 'Failed to update match.' }, { status: 500 });
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can delete matches.');
    }

    await deleteMatch(params.matchId);
    return NextResponse.json({ success: true, message: 'Match deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/tournaments/:id/matches/:matchId]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete match.' }, { status: 500 });
  }
}