// src/app/api/tournaments/[id]/teams/[teamId]/route.js

/**
 * GET    /api/tournaments/:id/teams/:teamId  — fetch team
 * PATCH  /api/tournaments/:id/teams/:teamId  — update (owner only)
 * DELETE /api/tournaments/:id/teams/:teamId  — delete (owner only)
 */

import { NextResponse }                         from 'next/server';
import { getSession, unauthorized, forbidden }   from '@/lib/auth';
import { getTournamentById }                     from '@/services/tournamentService';
import { getTeamById, updateTeam, deleteTeam, isTeamNameTaken } from '@/services/teamService';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const team = await getTeamById(params.teamId);
    if (!team || team.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Team not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, team }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments/:id/teams/:teamId]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch team.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const team = await getTeamById(params.teamId);
    if (!team || team.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Team not found.' }, { status: 404 });
    }
    if (team.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can edit teams.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    const errors = {};
    if ('name' in body) {
      if (!body.name?.trim()) errors.name = 'Team name is required.';
      else if (body.name.trim().length > 100) errors.name = 'Team name must be 100 characters or fewer.';
    }
    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // Unique name check (exclude current team)
    if (body.name) {
      const taken = await isTeamNameTaken(params.id, body.name, params.teamId);
      if (taken) {
        return NextResponse.json({
          success: false, message: 'A team with this name already exists.',
          errors: { name: 'Team name already taken in this tournament.' },
        }, { status: 409 });
      }
    }

    const updates = {};
    if ('name'       in body) updates.name       = body.name?.trim()       || null;
    if ('logo_url'   in body) updates.logo_url   = body.logo_url?.trim()   || null;
    if ('coach_name' in body) updates.coach_name = body.coach_name?.trim() || null;

    const updated = await updateTeam(params.teamId, updates);
    return NextResponse.json({ success: true, message: 'Team updated.', team: updated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/tournaments/:id/teams/:teamId]', error);
    return NextResponse.json({ success: false, message: 'Failed to update team.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const team = await getTeamById(params.teamId);
    if (!team || team.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Team not found.' }, { status: 404 });
    }
    if (team.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can delete teams.');
    }

    await deleteTeam(params.teamId);
    return NextResponse.json({ success: true, message: 'Team deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/tournaments/:id/teams/:teamId]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete team.' }, { status: 500 });
  }
}