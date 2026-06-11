// src/app/tournaments/[id]/teams/[teamId]/players/[playerId]/edit/page.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PlayerForm from '@/components/players/PlayerForm';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES, API, PLAYER_POSITION_LABELS } from '@/lib/constants';
import { useTeam } from '@/hooks/useTeam';
import useAuth from '@/hooks/useAuth';

function Chevron() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function EditPlayerContent({ tournamentId, teamId, playerId }) {
  const { user } = useAuth();
  const { team, loading: teamLoading, isOwner } = useTeam(tournamentId, teamId);

  const [player,        setPlayer]        = useState(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError,   setPlayerError]   = useState(null);

  useEffect(() => {
    async function loadPlayer() {
      try {
        const res  = await fetch(API.TEAM_PLAYER(tournamentId, teamId, playerId), { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Player not found.');
        setPlayer(data.player);
      } catch (err) {
        setPlayerError(err.message);
      } finally {
        setPlayerLoading(false);
      }
    }
    loadPlayer();
  }, [tournamentId, teamId, playerId]);

  const loading = teamLoading || playerLoading;

  if (loading) return (
    <DashboardLayout><SectionSpinner message="Loading player…" /></DashboardLayout>
  );

  if (playerError || !player) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{playerError || 'Player not found.'}</p>
        <Button href={ROUTES.TEAM(tournamentId, teamId)} variant="secondary" size="sm">Back to Team</Button>
      </div>
    </DashboardLayout>
  );

  if (!isOwner) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-red-500">
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="font-display font-bold text-slate-700">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can edit players.</p>
        </div>
        <Button href={ROUTES.TEAM(tournamentId, teamId)} variant="secondary" size="sm">Back to Team</Button>
      </div>
    </DashboardLayout>
  );

  const positionLabel = PLAYER_POSITION_LABELS[player.position] ?? player.position;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 animate-fade-in">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[80px]">
            {player.tournament_name ?? 'Tournament'}
          </Link>
          <Chevron />
          <Link href={ROUTES.TEAMS(tournamentId)} className="hover:text-blue-600 transition-colors">Teams</Link>
          <Chevron />
          <Link href={ROUTES.TEAM(tournamentId, teamId)} className="hover:text-blue-600 transition-colors truncate max-w-[80px]">
            {player.team_name ?? team?.name}
          </Link>
          <Chevron />
          <span className="text-slate-600 font-medium truncate max-w-[80px]">{player.full_name}</span>
          <Chevron />
          <span className="text-slate-600 font-medium">Edit</span>
        </nav>

        {/* Page header */}
        <div className="flex items-center gap-4">
          {/* Player avatar */}
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600 shrink-0 overflow-hidden border-2 border-slate-300">
            {player.photo_url
              ? <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
              : <span>{player.full_name.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900 truncate">Edit Player</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              <span className="font-medium text-slate-700">{player.full_name}</span>
              {' · '}
              <span>#{player.jersey_number}</span>
              {' · '}
              <span>{positionLabel}</span>
            </p>
          </div>
          <Link
            href={ROUTES.TEAM(tournamentId, teamId)}
            className="shrink-0 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
        </div>

        <PlayerForm
          mode="edit"
          tournamentId={tournamentId}
          teamId={teamId}
          playerId={playerId}
          initialData={player}
        />
      </div>
    </DashboardLayout>
  );
}

export default function EditPlayerPage({ params }) {
  return (
    <ProtectedRoute>
      <EditPlayerContent
        tournamentId={params.id}
        teamId={params.teamId}
        playerId={params.playerId}
      />
    </ProtectedRoute>
  );
}