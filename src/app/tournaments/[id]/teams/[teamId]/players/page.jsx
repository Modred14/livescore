// src/app/tournaments/[id]/players/page.js

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentHeader from '@/components/tournaments/TournamentHeader';
import PlayerList from '@/components/players/PlayerList';
import PlayerCard from '@/components/players/PlayerCard';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ROUTES, API, PLAYER_POSITION_LABELS } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import { useTournamentPlayers } from '@/hooks/useTeam';
import useAuth from '@/hooks/useAuth';

function PlayersContent({ tournamentId }) {
  const { user } = useAuth();
  const { tournament, loading: tLoading } = useTournament(tournamentId);
  const { players, loading, error, refresh, filters, setFilters } = useTournamentPlayers(tournamentId);

  const isOwner = !!user && tournament?.owner_id === user.id;

  const [view,          setView]          = useState('list');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  // ── Position counts ────────────────────────────────────────────────────────
  const positionCounts = players.reduce((acc, p) => {
    acc[p.position] = (acc[p.position] || 0) + 1;
    return acc;
  }, {});

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(
        API.TEAM_PLAYER(tournamentId, deleteTarget.team_id, deleteTarget.id),
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) { setDeleteError(data.message || 'Remove failed.'); return; }
      setDeleteTarget(null);
      refresh();
    } catch { setDeleteError('A network error occurred.'); }
    finally  { setDeleteLoading(false); }
  };

  return (
    <DashboardLayout>
      {/* Tournament header */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-8">
        <TournamentHeader tournament={tournament} isOwner={isOwner} activeTab="Players" />
      </div>

      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">All Players</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${players.length} player${players.length !== 1 ? 's' : ''} across all teams`}
            </p>
          </div>
          {isOwner && (
            <Button
              href={ROUTES.TEAMS(tournamentId)}
              variant="secondary"
              size="sm"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z" />
                </svg>
              }
            >
              Manage Teams
            </Button>
          )}
        </div>

        {/* Position stats */}
        {!loading && players.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { pos: 'goalkeeper', color: 'bg-yellow-50', text: 'text-yellow-600' },
              { pos: 'defender',   color: 'bg-blue-50',   text: 'text-blue-600'   },
              { pos: 'midfielder', color: 'bg-green-50',  text: 'text-green-600'  },
              { pos: 'forward',    color: 'bg-red-50',    text: 'text-red-600'    },
            ].map(({ pos, color, text }) => (
              <StatCard
                key={pos}
                label={PLAYER_POSITION_LABELS[pos]}
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
        )}

        {/* View toggle */}
        {!loading && players.length > 0 && (
          <div className="flex justify-end">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
              {['list', 'grid'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={['px-3 py-2 transition-colors text-xs font-medium', view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'].join(' ')}
                  aria-pressed={view === v}
                >
                  {v === 'list' ? 'List' : 'Grid'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SectionSpinner message="Loading players…" />
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>Retry</Button>
          </div>
        ) : view === 'grid' && players.length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="search"
                  placeholder="Search players…"
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={filters.position}
                onChange={(e) => setFilters((f) => ({ ...f, position: e.target.value }))}
                className="w-full sm:w-44 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Positions</option>
                <option value="goalkeeper">Goalkeepers</option>
                <option value="defender">Defenders</option>
                <option value="midfielder">Midfielders</option>
                <option value="forward">Forwards</option>
              </select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {players.map((p) => (
                <PlayerCard
                  key={p.id}
                  player={p}
                  tournamentId={tournamentId}
                  isOwner={isOwner}
                  onDelete={setDeleteTarget}
                  view="grid"
                />
              ))}
            </div>
          </>
        ) : (
          <PlayerList
            players={players}
            tournamentId={tournamentId}
            isOwner={isOwner}
            onDelete={setDeleteTarget}
            filters={filters}
            onFilter={setFilters}
            showTeam
          />
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Remove Player"
        message={deleteTarget ? `Remove ${deleteTarget.full_name} (#${deleteTarget.jersey_number}) from ${deleteTarget.team_name}?` : ''}
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

export default function PlayersPage({ params }) {
  return (
    <ProtectedRoute>
      <PlayersContent tournamentId={params.id} />
    </ProtectedRoute>
  );
}