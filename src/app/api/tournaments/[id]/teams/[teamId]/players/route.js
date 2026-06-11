// src/app/api/tournaments/[id]/teams/[teamId]/players/route.js

/**
 * GET  /api/tournaments/:id/teams/:teamId/players  — list players
 * POST /api/tournaments/:id/teams/:teamId/players  — add player (owner only)
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import { getTeamById }                           from '@/services/teamService';
import { getPlayersByTeam, createPlayer, isJerseyTaken } from '@/services/playerService';

const VALID_POSITIONS = ['goalkeeper', 'defender', 'midfielder', 'forward'];

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const team = await getTeamById(params.teamId);
    if (!team || team.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Team not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const players = await getPlayersByTeam(params.teamId, {
      position: searchParams.get('position') || undefined,
      search:   searchParams.get('search')   || undefined,
    });

    return NextResponse.json({ success: true, players }, { status: 200 });
  } catch (error) {
    console.error('[GET players]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch players.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const team = await getTeamById(params.teamId);
    if (!team || team.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Team not found.' }, { status: 404 });
    }
    if (team.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can add players.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    // Validate
    const errors = {};
    if (!body.full_name?.trim())           errors.full_name     = 'Player name is required.';
    else if (body.full_name.trim().length > 120) errors.full_name = 'Name must be 120 characters or fewer.';

    const jersey = parseInt(body.jersey_number, 10);
    if (!body.jersey_number && body.jersey_number !== 0) errors.jersey_number = 'Jersey number is required.';
    else if (isNaN(jersey) || jersey < 1 || jersey > 99) errors.jersey_number = 'Jersey number must be between 1 and 99.';

    if (!body.position)                          errors.position = 'Position is required.';
    else if (!VALID_POSITIONS.includes(body.position)) errors.position = 'Invalid position.';

    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // Duplicate jersey check
    const jerseyTaken = await isJerseyTaken(params.teamId, jersey);
    if (jerseyTaken) {
      return NextResponse.json({
        success: false, message: `Jersey number ${jersey} is already taken in this team.`,
        errors: { jersey_number: `#${jersey} is already assigned to another player.` },
      }, { status: 409 });
    }

    const player = await createPlayer(params.teamId, {
      full_name:     body.full_name.trim(),
      jersey_number: jersey,
      position:      body.position,
      photo_url:     body.photo_url?.trim() || null,
    });

    return NextResponse.json({ success: true, message: 'Player added successfully.', player }, { status: 201 });
  } catch (error) {
    console.error('[POST players]', error);
    return NextResponse.json({ success: false, message: 'Failed to add player.' }, { status: 500 });
  }
}