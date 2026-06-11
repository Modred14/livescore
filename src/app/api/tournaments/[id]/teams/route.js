// src/app/api/tournaments/[id]/teams/route.js

/**
 * GET  /api/tournaments/:id/teams  — list all teams in a tournament
 * POST /api/tournaments/:id/teams  — create a team (owner only)
 */

import { NextResponse }                     from 'next/server';
import { getSession, unauthorized, forbidden } from '@/lib/auth';
import { getTournamentById }                from '@/services/tournamentService';
import { getTeamsByTournament, createTeam, isTeamNameTaken } from '@/services/teamService';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const teams = await getTeamsByTournament(params.id, {
      search: searchParams.get('search') || undefined,
    });

    return NextResponse.json({ success: true, teams }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments/:id/teams]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch teams.' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json({ success: false, message: 'Tournament not found.' }, { status: 404 });
    }
    if (tournament.owner_id !== session.id) {
      return forbidden('Only the tournament owner can add teams.');
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    // Validate
    const errors = {};
    if (!body.name?.trim())           errors.name = 'Team name is required.';
    else if (body.name.trim().length > 100) errors.name = 'Team name must be 100 characters or fewer.';

    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    // Unique name check
    const taken = await isTeamNameTaken(params.id, body.name);
    if (taken) {
      return NextResponse.json({
        success: false, message: 'A team with this name already exists in this tournament.',
        errors: { name: 'Team name already taken in this tournament.' },
      }, { status: 409 });
    }

    const team = await createTeam(params.id, {
      name:       body.name.trim(),
      logo_url:   body.logo_url?.trim()   || null,
      coach_name: body.coach_name?.trim() || null,
    });

    return NextResponse.json({ success: true, message: 'Team created successfully.', team }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tournaments/:id/teams]', error);
    return NextResponse.json({ success: false, message: 'Failed to create team.' }, { status: 500 });
  }
}