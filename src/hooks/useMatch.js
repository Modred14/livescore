// src/hooks/useMatch.js

'use client';

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/lib/constants';
import useAuth from '@/hooks/useAuth';

// ── Single match ──────────────────────────────────────────────────────────────
export function useMatch(tournamentId, matchId) {
  const { user }  = useAuth();
  const [match,   setMatch]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!tournamentId || !matchId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await window.fetch(API.TOURNAMENT_MATCH(tournamentId, matchId), { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load match.');
      setMatch(data.match);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, matchId]);

  useEffect(() => { load(); }, [load]);

  return {
    match,
    loading,
    error,
    refresh:  load,
    isOwner:  !!user && match?.tournament_owner_id === user.id,
  };
}

// ── Matches list for a tournament ─────────────────────────────────────────────
export function useMatches(tournamentId) {
  const [matches,  setMatches]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filters,  setFilters]  = useState({
    status:     '',
    round_name: '',
    search:     '',
    date_from:  '',
    date_to:    '',
  });

  const load = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status)     params.set('status',     filters.status);
      if (filters.round_name) params.set('round_name', filters.round_name);
      if (filters.search)     params.set('search',     filters.search);
      if (filters.date_from)  params.set('date_from',  filters.date_from);
      if (filters.date_to)    params.set('date_to',    filters.date_to);

      const qs   = params.toString() ? `?${params}` : '';
      const res  = await window.fetch(`${API.TOURNAMENT_MATCHES(tournamentId)}${qs}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load matches.');
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, filters]);

  useEffect(() => { load(); }, [load]);

  // Derived groupings
  const live      = matches.filter((m) => m.status === 'live' || m.status === 'half_time');
  const upcoming  = matches.filter((m) => m.status === 'scheduled');
  const finished  = matches.filter((m) => m.status === 'completed');
  const postponed = matches.filter((m) => m.status === 'postponed' || m.status === 'cancelled');

  return {
    matches,
    live,
    upcoming,
    finished,
    postponed,
    loading,
    error,
    refresh:    load,
    filters,
    setFilters,
  };
}

export default useMatch;