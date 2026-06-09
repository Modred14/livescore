// src/hooks/useTournament.js

'use client';

/**
 * useTournament — fetch and manage a single tournament's state.
 *
 * Usage:
 *   const { tournament, loading, error, refresh, isOwner } = useTournament(id);
 *
 * useTournaments — fetch the list of tournaments for the current user.
 *
 * Usage:
 *   const { tournaments, loading, error, refresh, filters, setFilters } = useTournaments();
 */

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/lib/constants';
import useAuth from '@/hooks/useAuth';

// ── Single tournament ─────────────────────────────────────────────────────────

export function useTournament(id) {
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await window.fetch(API.TOURNAMENT(id), { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load tournament.');
      setTournament(data.tournament);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    tournament,
    loading,
    error,
    refresh: fetch,
    isOwner: !!user && tournament?.owner_id === user.id,
  };
}

// ── Tournament list ───────────────────────────────────────────────────────────

export function useTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filters,     setFilters]     = useState({
    status:          '',
    tournament_type: '',
    search:          '',
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status)          params.set('status',          filters.status);
      if (filters.tournament_type) params.set('tournament_type', filters.tournament_type);
      if (filters.search)          params.set('search',          filters.search);

      const url  = `${API.TOURNAMENTS}${params.toString() ? '?' + params.toString() : ''}`;
      const res  = await window.fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load tournaments.');
      setTournaments(data.tournaments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    tournaments,
    loading,
    error,
    refresh:    fetch,
    filters,
    setFilters,
  };
}

export default useTournament;