// src/app/tournaments/[id]/matches/[matchId]/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MatchHeader from '@/components/matches/MatchHeader';
import MatchDetails from '@/components/matches/MatchDetails';
import MatchStats from '@/components/matches/MatchStats';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ROUTES, API } from '@/lib/constants';
import { useMatch } from '@/hooks/useMatch';
import { useTournament } from '@/hooks/useTournament';

function MatchDetailContent({ tournamentId, matchId }) {
  const router = useRouter();
  const { tournament }                              = useTournament(tournamentId);
  const { match, loading, error, isOwner, refresh } = useMatch(tournamentId, matchId);

  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT_MATCH(tournamentId, matchId), { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) { setDeleteError(data.message || 'Delete failed.'); return; }
      router.push(ROUTES.MATCHES(tournamentId));
      router.refresh();
    } catch { setDeleteError('A network error occurred.'); }
    finally  { setDeleteLoading(false); }
  };

  if (loading) return (
    <DashboardLayout><SectionSpinner message="Loading match…" /></DashboardLayout>
  );

  if (error || !match) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{error || 'Match not found.'}</p>
        <Button href={ROUTES.MATCHES(tournamentId)} variant="secondary" size="sm">Back to Fixtures</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Match scoreboard header */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-8">
        <MatchHeader
          match={match}
          tournament={tournament}
          isOwner={isOwner}
          onDelete={() => setDeleteOpen(true)}
        />
      </div>

      <div className="space-y-6 animate-fade-in">

        {/* Stats row */}
        <MatchStats match={match} />

        {/* Body: main content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Phase 6 preview callout */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-600">
                    <path d="M3.25 4A2.25 2.25 0 001 6.25v7.5A2.25 2.25 0 003.25 16h7.5A2.25 2.25 0 0013 13.75v-7.5A2.25 2.25 0 0010.75 4h-7.5zM19 4.75a.75.75 0 00-1.28-.53l-3 3a.75.75 0 00-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 001.28-.53V4.75z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm mb-1">Live Events — Coming in Phase 6</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Goals, yellow cards, red cards, and substitutions will be recorded here in real time.
                    Match status changes and live score updates are also part of Phase 6.
                  </p>
                  {isOwner && (match.status === 'live' || match.status === 'half_time') && (
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      This match is currently live — events can be added once Phase 6 is deployed.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick status update (owner only) */}
            {isOwner && (
              <Card>
                <h3 className="font-display font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <Button href={ROUTES.MATCH_EDIT(tournamentId, matchId)} size="sm" variant="secondary"
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
                        <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                      </svg>
                    }
                  >
                    Edit Match
                  </Button>
                  <Button href={ROUTES.MATCHES(tournamentId)} size="sm" variant="neutral">
                    All Fixtures
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setDeleteOpen(true)}
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                        <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Delete Match
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <MatchDetails match={match} tournament={tournament} />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Match"
        message={`Permanently delete the fixture between ${match.home_team_name} and ${match.away_team_name}?`}
        confirmLabel="Yes, Delete"
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

export default function MatchDetailPage({ params }) {
  return <ProtectedRoute><MatchDetailContent tournamentId={params.id} matchId={params.matchId} /></ProtectedRoute>;
}