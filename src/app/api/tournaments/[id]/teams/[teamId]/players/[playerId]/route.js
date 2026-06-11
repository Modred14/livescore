// src/app/api/tournaments/[id]/teams/[teamId]/players/[playerId]/route.js

/**
 * GET    /api/tournaments/:id/teams/:teamId/players/:playerId
 * PATCH  /api/tournaments/:id/teams/:teamId/players/:playerId  (owner only)
 * DELETE /api/tournaments/:id/teams/:teamId/players/:playerId  (owner only)
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import { getTeamById }                           from '@/services/teamService';
import { getPlayerById, updatePlayer, deletePlayer, isJerseyTaken } from '@/services/playerService';

const VALID_POSITIONS = ['goalkeeper', 'defender', 'midfielder', 'forward'];

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const player = await getPlayerById(params.playerId);
    if (!player || player.team_id !== params.teamId || player.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Player not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, player }, { status: 200 });
  } catch (error) {
    console.error('[GET player]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch player.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const player = await getPlayerById(params.playerId);
    if (!player || player.team_id !== params.teamId || player.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Player not found.' }, { status: 404 });
    }
    if (player.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can edit players.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    const errors = {};
    if ('full_name' in body) {
      if (!body.full_name?.trim()) errors.full_name = 'Player name is required.';
      else if (body.full_name.trim().length > 120) errors.full_name = 'Name must be 120 characters or fewer.';
    }
    if ('jersey_number' in body) {
      const j = parseInt(body.jersey_number, 10);
      if (isNaN(j) || j < 1 || j > 99) errors.jersey_number = 'Jersey number must be between 1 and 99.';
    }
    if ('position' in body && !VALID_POSITIONS.includes(body.position)) {
      errors.position = 'Invalid position.';
    }
    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // Jersey uniqueness check (exclude current player)
    if ('jersey_number' in body) {
      const jersey = parseInt(body.jersey_number, 10);
      const taken  = await isJerseyTaken(params.teamId, jersey, params.playerId);
      if (taken) {
        return NextResponse.json({
          success: false, message: `Jersey #${jersey} is already taken.`,
          errors: { jersey_number: `#${jersey} is already assigned to another player.` },
        }, { status: 409 });
      }
    }

    const updates = {};
    if ('full_name'     in body) updates.full_name     = body.full_name?.trim() || null;
    if ('jersey_number' in body) updates.jersey_number = parseInt(body.jersey_number, 10);
    if ('position'      in body) updates.position      = body.position;
    if ('photo_url'     in body) updates.photo_url     = body.photo_url?.trim() || null;

    const updated = await updatePlayer(params.playerId, updates);
    return NextResponse.json({ success: true, message: 'Player updated.', player: updated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH player]', error);
    return NextResponse.json({ success: false, message: 'Failed to update player.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const player = await getPlayerById(params.playerId);
    if (!player || player.team_id !== params.teamId || player.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Player not found.' }, { status: 404 });
    }
    if (player.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can remove players.');
    }

    await deletePlayer(params.playerId);
    return NextResponse.json({ success: true, message: 'Player removed successfully.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE player]', error);
    return NextResponse.json({ success: false, message: 'Failed to remove player.' }, { status: 500 });
  }
}