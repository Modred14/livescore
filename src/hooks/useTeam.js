// src/hooks/useTeam.js

'use client';

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/lib/constants';
import useAuth from '@/hooks/useAuth';

// ── Teams list for a tournament ───────────────────────────────────────────────

export function useTeams(tournamentId) {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState('');

  const fetch = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res    = await window.fetch(`${API.TOURNAMENT_TEAMS(tournamentId)}${params}`, { credentials: 'include' });
      const data   = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load teams.');
      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { teams, loading, error, refresh: fetch, search, setSearch };
}

// ── Single team ───────────────────────────────────────────────────────────────

export function useTeam(tournamentId, teamId) {
  const { user } = useAuth();
  const [team,    setTeam]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (!tournamentId || !teamId) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await window.fetch(API.TOURNAMENT_TEAM(tournamentId, teamId), { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load team.');
      setTeam(data.team);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, teamId]);

  useEffect(() => { fetch(); }, [fetch]);

  return {
    team,
    loading,
    error,
    refresh: fetch,
    isOwner: !!user && team?.tournament_owner_id === user.id,
  };
}

// ── Players list for a team ───────────────────────────────────────────────────

export function usePlayers(tournamentId, teamId) {
  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filters,  setFilters]  = useState({ search: '', position: '' });

  const fetch = useCallback(async () => {
    if (!tournamentId || !teamId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search)   params.set('search',   filters.search);
      if (filters.position) params.set('position', filters.position);
      const qs  = params.toString() ? `?${params}` : '';
      const res = await window.fetch(`${API.TEAM_PLAYERS(tournamentId, teamId)}${qs}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load players.');
      setPlayers(data.players || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, teamId, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { players, loading, error, refresh: fetch, filters, setFilters };
}

// ── All players across tournament ─────────────────────────────────────────────

export function useTournamentPlayers(tournamentId) {
  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [filters,  setFilters]  = useState({ search: '', position: '' });

  const fetch = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch all teams, then aggregate their players client-side
      const teamsRes  = await window.fetch(API.TOURNAMENT_TEAMS(tournamentId), { credentials: 'include' });
      const teamsData = await teamsRes.json();
      if (!teamsRes.ok) throw new Error(teamsData.message || 'Failed to load teams.');

      const allPlayers = [];
      await Promise.all(
        (teamsData.teams || []).map(async (team) => {
          const params = new URLSearchParams();
          if (filters.search)   params.set('search',   filters.search);
          if (filters.position) params.set('position', filters.position);
          const qs  = params.toString() ? `?${params}` : '';
          const res = await window.fetch(`${API.TEAM_PLAYERS(tournamentId, team.id)}${qs}`, { credentials: 'include' });
          const data = await res.json();
          if (res.ok) allPlayers.push(...(data.players || []));
        })
      );

      // Sort by team name then jersey number
      allPlayers.sort((a, b) =>
        a.team_name.localeCompare(b.team_name) || a.jersey_number - b.jersey_number
      );
      setPlayers(allPlayers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tournamentId, filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { players, loading, error, refresh: fetch, filters, setFilters };
}

export default useTeam;