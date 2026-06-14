// src/app/api/tournaments/[id]/matches/[matchId]/status/route.js

/**
 * PATCH /api/tournaments/:id/matches/:matchId/status
 *
 * Transitions a match through its lifecycle:
 *   scheduled → live → half_time → completed
 *
 * Also inserts a lifecycle event (kick_off, half_time, full_time).
 * Only the tournament owner can call this.
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import { getMatchById }                          from '@/services/matchService';
import { transitionMatchStatus }                 from '@/services/eventService';

const VALID_STATUSES = ['live', 'half_time', 'completed', 'postponed', 'cancelled'];

export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can change match status.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    const { status } = body || {};
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or missing status.',
        errors:  { status: `Status must be one of: ${VALID_STATUSES.join(', ')}` },
      }, { status: 422 });
    }

    const updated = await transitionMatchStatus(params.matchId, status, session.id);

    return NextResponse.json({
      success: true,
      message: `Match status updated to '${status}'.`,
      match:   updated,
    }, { status: 200 });

  } catch (error) {
    console.error('[PATCH /status]', error);
    const isTransitionError = error.message.includes('Cannot transition') || error.message.includes('authorised');
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update match status.' },
      { status: isTransitionError ? 422 : 500 }
    );
  }
}