// src/app/api/tournaments/[id]/matches/[matchId]/squads/route.js

/**
 * GET /api/tournaments/:id/matches/:matchId/squads
 *
 * Returns all players from both teams participating in the match.
 * Used by the event form dropdowns in the live admin panel.
 */

import { NextResponse }                from 'next/server';
import { getSession, unauthorized }    from '@/lib/auth';
import { getMatchById }                from '@/services/matchService';
import { getMatchSquads }              from '@/services/eventService';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }

    const players = await getMatchSquads(params.matchId);

    return NextResponse.json({ success: true, players }, { status: 200 });
  } catch (error) {
    console.error('[GET squads]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch squads.' }, { status: 500 });
  }
}