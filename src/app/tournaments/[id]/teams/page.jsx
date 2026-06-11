// src/app/tournaments/[id]/teams/page.js

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentHeader from '@/components/tournaments/TournamentHeader';
import TeamCard from '@/components/teams/TeamCard';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SectionSpinner } from '@/components/ui/Spinner';
import { ConfirmModal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/Input';
import { ROUTES, API } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import { useTeams } from '@/hooks/useTeam';
import useAuth from '@/hooks/useAuth';

function TeamsContent({ tournamentId }) {
  const { user } = useAuth();
  const { tournament, loading: tLoading } = useTournament(tournamentId);
  const { teams, loading, error, refresh, search, setSearch } = useTeams(tournamentId);

  const isOwner = !!user && tournament?.owner_id === user.id;

  const [view,          setView]          = useState('grid');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(API.TOURNAMENT_TEAM(tournamentId, deleteTarget.id), {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setDeleteError(data.message || 'Delete failed.'); return; }
      setDeleteTarget(null);
      refresh();
    } catch { setDeleteError('A network error occurred.'); }
    finally  { setDeleteLoading(false); }
  };

  return (
    <DashboardLayout>
      {/* Tournament header */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-8">
        <TournamentHeader tournament={tournament} isOwner={isOwner} activeTab="Teams" />
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Teams</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${teams.length} team${teams.length !== 1 ? 's' : ''} registered`}
            </p>
          </div>
          {isOwner && (
            <Button
              href={ROUTES.TEAM_CREATE(tournamentId)}
              size="sm"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              }
            >
              Add Team
            </Button>
          )}
        </div>

        {/* Search + view toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <SearchInput
              placeholder="Search teams…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
            {['grid', 'list'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={['px-3 py-2 transition-colors', view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'].join(' ')}
                aria-label={`${v} view`}
              >
                {v === 'grid'
                  ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm6.5-9A2.25 2.25 0 008.5 4.25v2.5A2.25 2.25 0 0010.75 9h2.5A2.25 2.25 0 0015.5 6.75v-2.5A2.25 2.25 0 0013.25 2h-2.5zm0 9a2.25 2.25 0 00-2.25 2.25v2.5a2.25 2.25 0 002.25 2.25h2.5a2.25 2.25 0 002.25-2.25v-2.5a2.25 2.25 0 00-2.25-2.25h-2.5z" clipRule="evenodd" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" /></svg>
                }
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SectionSpinner message="Loading teams…" />
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>Retry</Button>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <EmptyState
              title={search ? 'No teams match your search' : 'No teams yet'}
              message={
                search
                  ? 'Try a different search term.'
                  : isOwner
                  ? 'Add teams to get the tournament going.'
                  : 'No teams have been registered yet.'
              }
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              }
              action={isOwner && !search && (
                <Button href={ROUTES.TEAM_CREATE(tournamentId)} size="sm">Add first team</Button>
              )}
            />
          </div>
        ) : (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-3'
          }>
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                tournamentId={tournamentId}
                isOwner={isOwner}
                onDelete={setDeleteTarget}
                view={view}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Team"
        message={deleteTarget ? `Permanently delete "${deleteTarget.name}"? All players will also be removed.` : ''}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep it"
        variant="danger"
      />
      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          {deleteError}
        </div>
      )}
    </DashboardLayout>
  );
}

export default function TeamsPage({ params }) {
  return <ProtectedRoute><TeamsContent tournamentId={params.id} /></ProtectedRoute>;
}