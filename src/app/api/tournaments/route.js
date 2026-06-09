// src/app/api/tournaments/route.js

/**
 * GET  /api/tournaments  — list authenticated user's tournaments (with filters)
 * POST /api/tournaments  — create a new tournament
 */

import { NextResponse }         from 'next/server';
import { getSession, unauthorized } from '@/lib/auth';
import {
  createTournament,
  getTournamentsByOwner,
} from '@/services/tournamentService';

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const { searchParams } = new URL(request.url);
    const filters = {
      status:          searchParams.get('status')          || undefined,
      tournament_type: searchParams.get('tournament_type') || undefined,
      search:          searchParams.get('search')          || undefined,
    };

    const tournaments = await getTournamentsByOwner(session.id, filters);

    return NextResponse.json({ success: true, tournaments }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tournaments.' },
      { status: 500 }
    );
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // ── Validate ────────────────────────────────────────────────────────────
    const errors = validateTournamentBody(body);
    if (Object.keys(errors).length) {
      return NextResponse.json(
        { success: false, message: 'Validation failed.', errors },
        { status: 422 }
      );
    }

    const tournament = await createTournament(session.id, {
      name:            body.name.trim(),
      description:     body.description?.trim() || null,
      logo_url:        body.logo_url?.trim()    || null,
      tournament_type: body.tournament_type,
      location:        body.location?.trim()    || null,
      start_date:      body.start_date,
      end_date:        body.end_date,
      status:          body.status || 'draft',
    });

    return NextResponse.json(
      { success: true, message: 'Tournament created successfully.', tournament },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/tournaments]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create tournament.' },
      { status: 500 }
    );
  }
}

// ── Validation helper ─────────────────────────────────────────────────────────
const VALID_TYPES    = ['league', 'knockout', 'group_stage', 'round_robin'];
const VALID_STATUSES = ['draft', 'upcoming', 'active', 'completed'];

function validateTournamentBody(body) {
  const errors = {};
  const { name, tournament_type, start_date, end_date, status } = body || {};

  if (!name?.trim())
    errors.name = 'Tournament name is required.';
  else if (name.trim().length > 150)
    errors.name = 'Name must be 150 characters or fewer.';

  if (!tournament_type)
    errors.tournament_type = 'Tournament type is required.';
  else if (!VALID_TYPES.includes(tournament_type))
    errors.tournament_type = 'Invalid tournament type.';

  if (!start_date)
    errors.start_date = 'Start date is required.';

  if (!end_date)
    errors.end_date = 'End date is required.';

  if (start_date && end_date && new Date(end_date) < new Date(start_date))
    errors.end_date = 'End date must be on or after the start date.';

  if (status && !VALID_STATUSES.includes(status))
    errors.status = 'Invalid status value.';

  return errors;
}