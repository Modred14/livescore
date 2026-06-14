// src/hooks/useLiveMatch.js

'use client';

/**
 * useLiveMatch — polls the match and its events on an interval.
 *
 * For live matches it polls every 5 seconds.
 * For completed/scheduled matches it fetches once.
 *
 * Exposes helpers for owner actions (start, pause, finish, addEvent, deleteEvent).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API } from '@/lib/constants';
import useAuth from '@/hooks/useAuth';

const POLL_INTERVAL_MS = 5_000; // 5 seconds

export default function useLiveMatch(tournamentId, matchId) {
  const { user } = useAuth();

  const [match,    setMatch]    = useState(null);
  const [events,   setEvents]   = useState([]);
  const [squads,   setSquads]   = useState({ home: [], away: [] });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [lastPoll, setLastPoll] = useState(null);

  const pollRef = useRef(null);

  // ── Fetch match + events ──────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!tournamentId || !matchId) return;
    try {
      const [matchRes, eventsRes] = await Promise.all([
        window.fetch(API.TOURNAMENT_MATCH(tournamentId, matchId), { credentials: 'include' }),
        window.fetch(API.MATCH_EVENTS(tournamentId, matchId),    { credentials: 'include' }),
      ]);

      const [matchData, eventsData] = await Promise.all([
        matchRes.json(),
        eventsRes.json(),
      ]);

      if (matchRes.ok  && matchData.success)  setMatch(matchData.match ?? null);
      if (eventsRes.ok && eventsData.success) setEvents(eventsData.events ?? []);
      setError(null);
      setLastPoll(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, matchId]);

  // ── Load squads once (doesn't change during match) ────────────────────────
  const fetchSquads = useCallback(async () => {
    if (!tournamentId || !matchId) return;
    try {
      const res  = await window.fetch(
        `/api/tournaments/${tournamentId}/matches/${matchId}/squads`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        const home = data.players.filter((p) => p.side === 'home');
        const away = data.players.filter((p) => p.side === 'away');
        setSquads({ home, away });
      }
    } catch { /* non-critical */ }
  }, [tournamentId, matchId]);

  // ── Polling setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
    fetchSquads();

    // Start polling — we'll check if live inside the interval
    pollRef.current = setInterval(() => {
      setMatch((prev) => {
        // Only keep polling if match is live
        if (prev && (prev.status === 'live' || prev.status === 'half_time')) {
          fetchAll();
        }
        return prev;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [fetchAll, fetchSquads]);

  // ── Owner actions ─────────────────────────────────────────────────────────

  const transitionStatus = useCallback(async (newStatus) => {
    const res  = await window.fetch(
      API.MATCH_STATUS_URL(tournamentId, matchId),
      {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ status: newStatus }),
      }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      setMatch(data.match);
      await fetchAll(); // also refresh events (lifecycle event inserted)
    }
    return data;
  }, [tournamentId, matchId, fetchAll]);

  const addEvent = useCallback(async (eventData) => {
    const res  = await window.fetch(
      API.MATCH_EVENTS(tournamentId, matchId),
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify(eventData),
      }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      // Optimistically add event and refresh match score
      setEvents((prev) => [...prev, data.event].sort((a, b) =>
        a.minute !== b.minute ? a.minute - b.minute : a.extra_time - b.extra_time
      ));
      await fetchAll(); // re-fetch to get updated score
    }
    return data;
  }, [tournamentId, matchId, fetchAll]);

  const removeEvent = useCallback(async (eventId) => {
    const res  = await window.fetch(
      API.MATCH_EVENT(tournamentId, matchId, eventId),
      { method: 'DELETE', credentials: 'include' }
    );
    const data = await res.json();
    if (res.ok && data.success) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      await fetchAll(); // re-fetch score after reversal
    }
    return data;
  }, [tournamentId, matchId, fetchAll]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = (() => {
    const homeTeamId = match?.home_team_id;
    const awayTeamId = match?.away_team_id;

    const countFor = (teamId, types) =>
      events.filter((e) => types.includes(e.event_type) && e.team_id === teamId).length;

    return {
      home: {
        goals:          match?.home_score ?? 0,
        yellow_cards:   countFor(homeTeamId, ['yellow_card']),
        red_cards:      countFor(homeTeamId, ['red_card','yellow_red_card']),
        substitutions:  countFor(homeTeamId, ['substitution']),
      },
      away: {
        goals:          match?.away_score ?? 0,
        yellow_cards:   countFor(awayTeamId, ['yellow_card']),
        red_cards:      countFor(awayTeamId, ['red_card','yellow_red_card']),
        substitutions:  countFor(awayTeamId, ['substitution']),
      },
    };
  })();

  return {
    match,
    events,
    squads,
    stats,
    loading,
    error,
    lastPoll,
    refresh:          fetchAll,
    transitionStatus,
    addEvent,
    removeEvent,
    isOwner: !!user && match?.tournament_owner_id === user.id,
    isLive:  match?.status === 'live' || match?.status === 'half_time',
    isDone:  match?.status === 'completed',
  };
}