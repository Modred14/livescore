// src/app/api/tournaments/[id]/route.js

/**
 * GET    /api/tournaments/:id  — fetch a single tournament
 * PATCH  /api/tournaments/:id  — update (owner only)
 * DELETE /api/tournaments/:id  — delete (owner only)
 */

import { NextResponse }              from 'next/server';
import { getSession, unauthorized, forbidden } from '@/lib/auth';
import {
  getTournamentById,
  updateTournament,
  deleteTournament,
} from '@/services/tournamentService';

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const tournament = await getTournamentById(params.id);
    if (!tournament) {
      return NextResponse.json(
        { success: false, message: 'Tournament not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tournament }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/tournaments/:id]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tournament.' },
      { status: 500 }
    );
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    // Verify tournament exists first
    const existing = await getTournamentById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Tournament not found.' },
        { status: 404 }
      );
    }

    // Ownership check
    if (existing.owner_id !== session.id) {
      return forbidden('You do not have permission to edit this tournament.');
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      );
    }

    // Validate only fields that are present in the body
    const errors = validatePatchBody(body);
    if (Object.keys(errors).length) {
      return NextResponse.json(
        { success: false, message: 'Validation failed.', errors },
        { status: 422 }
      );
    }

    // Sanitise updatable fields
    const updates = {};
    const stringFields = ['name', 'description', 'logo_url', 'location'];
    for (const f of stringFields) {
      if (f in body) updates[f] = body[f]?.trim() || null;
    }
    if ('tournament_type' in body) updates.tournament_type = body.tournament_type;
    if ('start_date'      in body) updates.start_date      = body.start_date;
    if ('end_date'        in body) updates.end_date        = body.end_date;
    if ('status'          in body) updates.status          = body.status;
    // name is required — don't allow empty string
    if ('name' in updates && !updates.name) {
      updates.name = existing.name;
    }

    const tournament = await updateTournament(params.id, session.id, updates);

    return NextResponse.json(
      { success: true, message: 'Tournament updated successfully.', tournament },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PATCH /api/tournaments/:id]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update tournament.' },
      { status: 500 }
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const existing = await getTournamentById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Tournament not found.' },
        { status: 404 }
      );
    }

    if (existing.owner_id !== session.id) {
      return forbidden('You do not have permission to delete this tournament.');
    }

    const deleted = await deleteTournament(params.id, session.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete tournament.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Tournament deleted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DELETE /api/tournaments/:id]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete tournament.' },
      { status: 500 }
    );
  }
}

// ── Validation ────────────────────────────────────────────────────────────────
const VALID_TYPES    = ['league', 'knockout', 'group_stage', 'round_robin'];
const VALID_STATUSES = ['draft', 'upcoming', 'active', 'completed'];

function validatePatchBody(body) {
  const errors = {};
  const { name, tournament_type, start_date, end_date, status } = body || {};

  if ('name' in body && !name?.trim())
    errors.name = 'Tournament name is required.';
  else if (name && name.trim().length > 150)
    errors.name = 'Name must be 150 characters or fewer.';

  if ('tournament_type' in body && !VALID_TYPES.includes(tournament_type))
    errors.tournament_type = 'Invalid tournament type.';

  if ('status' in body && !VALID_STATUSES.includes(status))
    errors.status = 'Invalid status value.';

  // Only validate date relationship if both are provided
  const s = start_date || body.start_date;
  const e = end_date   || body.end_date;
  if (s && e && new Date(e) < new Date(s))
    errors.end_date = 'End date must be on or after the start date.';

  return errors;
}