// src/app/tournaments/[id]/teams/[teamId]/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TeamHeader from '@/components/teams/TeamHeader';
import TeamRoster from '@/components/teams/TeamRoster';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { StatCard } from '@/components/ui/Card';
import { ROUTES, API, PLAYER_POSITION_LABELS } from '@/lib/constants';
import { useTeam, usePlayers } from '@/hooks/useTeam';
import { useTournament } from '@/hooks/useTournament';
import useAuth from '@/hooks/useAuth';

function TeamDetailContent({ tournamentId, teamId }) {
  const router = useRouter();
  const { user } = useAuth();
  const { tournament }  = useTournament(tournamentId);
  const { team, loading: teamLoading, error: teamError, isOwner } = useTeam(tournamentId, teamId);
  const { players, loading: playersLoading, refresh: refreshPlayers } = usePlayers(tournamentId, teamId);

  const [deleteTeamOpen,     setDeleteTeamOpen]     = useState(false);
  const [deleteTeamLoading,  setDeleteTeamLoading]  = useState(false);
  const [deletePlayer,       setDeletePlayer]       = useState(null);
  const [deletePlayerLoading,setDeletePlayerLoading]= useState(false);
  const [deleteError,        setDeleteError]        = useState('');

  // ── Delete team ────────────────────────────────────────────────────────────
  const handleDeleteTeam = async () => {
    setDeleteTeamLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT_TEAM(tournamentId, teamId), { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) { setDeleteError(data.message || 'Delete failed.'); return; }
      router.push(ROUTES.TEAMS(tournamentId));
      router.refresh();
    } catch { setDeleteError('A network error occurred.'); }
    finally  { setDeleteTeamLoading(false); }
  };

  // ── Delete player ──────────────────────────────────────────────────────────
  const handleDeletePlayer = async () => {
    if (!deletePlayer) return;
    setDeletePlayerLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TEAM_PLAYER(tournamentId, teamId, deletePlayer.id), { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) { setDeleteError(data.message || 'Remove failed.'); return; }
      setDeletePlayer(null);
      refreshPlayers();
    } catch { setDeleteError('A network error occurred.'); }
    finally  { setDeletePlayerLoading(false); }
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (teamLoading) return (
    <DashboardLayout><SectionSpinner message="Loading team…" /></DashboardLayout>
  );

  if (teamError || !team) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{teamError || 'Team not found.'}</p>
        <Button href={ROUTES.TEAMS(tournamentId)} variant="secondary" size="sm">Back to Teams</Button>
      </div>
    </DashboardLayout>
  );

  // Position breakdown counts
  const positionCounts = players.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      {/* Team header */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-8">
        <TeamHeader
          team={{ ...team, player_count: players.length }}
          tournament={tournament}
          isOwner={isOwner}
          onDelete={() => setDeleteTeamOpen(true)}
          activeTab="Squad"
        />
      </div>

      <div className="space-y-6 animate-fade-in">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Total Players"
            value={players.length}
            iconColor="bg-blue-50"
            iconText="text-blue-600"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
              </svg>
            }
          />
          {[
            { pos: 'goalkeeper', label: 'GK',  color: 'bg-yellow-50', text: 'text-yellow-600' },
            { pos: 'defender',   label: 'DEF', color: 'bg-blue-50',   text: 'text-blue-600'   },
            { pos: 'midfielder', label: 'MID', color: 'bg-green-50',  text: 'text-green-600'  },
          ].map(({ pos, label, color, text }) => (
            <StatCard
              key={pos}
              label={PLAYER_POSITION_LABELS[pos] ?? pos}
              value={positionCounts[pos] ?? 0}
              iconColor={color}
              iconText={text}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              }
            />
          ))}
        </div>

        {/* Squad section header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Squad <span className="text-slate-400 font-normal text-base">({players.length})</span>
          </h2>
          {isOwner && (
            <Button
              href={ROUTES.TEAM_PLAYER_CREATE(tournamentId, teamId)}
              size="sm"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              }
            >
              Add Player
            </Button>
          )}
        </div>

        {/* Roster */}
        {playersLoading ? (
          <SectionSpinner message="Loading squad…" />
        ) : (
          <TeamRoster
            players={players}
            tournamentId={tournamentId}
            teamId={teamId}
            isOwner={isOwner}
            onDelete={setDeletePlayer}
          />
        )}
      </div>

      {/* Delete team modal */}
      <ConfirmModal
        open={deleteTeamOpen}
        onClose={() => !deleteTeamLoading && setDeleteTeamOpen(false)}
        onConfirm={handleDeleteTeam}
        loading={deleteTeamLoading}
        title="Delete Team"
        message={`Permanently delete "${team.name}"? All ${players.length} player(s) will also be removed.`}
        confirmLabel="Yes, Delete Team"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Delete player modal */}
      <ConfirmModal
        open={!!deletePlayer}
        onClose={() => !deletePlayerLoading && setDeletePlayer(null)}
        onConfirm={handleDeletePlayer}
        loading={deletePlayerLoading}
        title="Remove Player"
        message={deletePlayer ? `Remove ${deletePlayer.full_name} (#${deletePlayer.jersey_number}) from the squad?` : ''}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        variant="danger"
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {deleteError}
        </div>
      )}
    </DashboardLayout>
  );
}

export default function TeamDetailPage({ params }) {
  return (
    <ProtectedRoute>
      <TeamDetailContent tournamentId={params.id} teamId={params.teamId} />
    </ProtectedRoute>
  );
}