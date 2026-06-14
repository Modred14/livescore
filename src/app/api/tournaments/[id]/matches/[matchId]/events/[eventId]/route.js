// src/app/api/tournaments/[id]/matches/[matchId]/events/[eventId]/route.js

/**
 * GET    /api/tournaments/:id/matches/:matchId/events/:eventId
 * PATCH  /api/tournaments/:id/matches/:matchId/events/:eventId  (owner, minute/note only)
 * DELETE /api/tournaments/:id/matches/:matchId/events/:eventId  (owner, reverses score)
 */

import { NextResponse }                        from 'next/server';
import { getSession, unauthorized, forbidden } from '@/lib/auth';
import { getMatchById }                        from '@/services/matchService';
import { getEventById, updateEvent, deleteEvent } from '@/services/eventService';

export async function GET(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const event = await getEventById(params.eventId);
    if (!event || event.match_id !== params.matchId) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error('[GET event]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch event.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can edit events.');
    }

    const event = await getEventById(params.eventId);
    if (!event || event.match_id !== params.matchId) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }

    let body;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 }); }

    const errors = {};
    if ('minute' in body) {
      const m = parseInt(body.minute, 10);
      if (isNaN(m) || m < 0 || m > 130) errors.minute = 'Minute must be 0–130.';
    }
    if ('extra_time' in body) {
      const e = parseInt(body.extra_time, 10);
      if (isNaN(e) || e < 0 || e > 30) errors.extra_time = 'Extra time must be 0–30.';
    }
    if (Object.keys(errors).length) {
      return NextResponse.json({ success: false, message: 'Validation failed.', errors }, { status: 422 });
    }

    const updates = {};
    if ('minute'     in body) updates.minute     = parseInt(body.minute, 10);
    if ('extra_time' in body) updates.extra_time = parseInt(body.extra_time, 10);
    if ('note'       in body) updates.note       = body.note?.trim() || null;

    const updated = await updateEvent(params.eventId, updates);
    return NextResponse.json({ success: true, message: 'Event updated.', event: updated }, { status: 200 });
  } catch (error) {
    console.error('[PATCH event]', error);
    return NextResponse.json({ success: false, message: 'Failed to update event.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession(request);
    if (!session) return unauthorized();

    const match = await getMatchById(params.matchId);
    if (!match || match.tournament_id !== params.id) {
      return NextResponse.json({ success: false, message: 'Match not found.' }, { status: 404 });
    }
    if (match.tournament_owner_id !== session.id) {
      return forbidden('Only the tournament owner can delete events.');
    }

    const event = await getEventById(params.eventId);
    if (!event || event.match_id !== params.matchId) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }

    await deleteEvent(params.eventId);
    return NextResponse.json({ success: true, message: 'Event removed and score adjusted.' }, { status: 200 });
  } catch (error) {
    console.error('[DELETE event]', error);
    return NextResponse.json({ success: false, message: 'Failed to delete event.' }, { status: 500 });
  }
}