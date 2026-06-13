// src/app/tournaments/[id]/matches/page.js

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentHeader from '@/components/tournaments/TournamentHeader';
import FixtureList from '@/components/matches/FixtureList';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/Card';
import { ROUTES, API } from '@/lib/constants';
import { useTournament } from '@/hooks/useTournament';
import { useMatches } from '@/hooks/useMatch';
import useAuth from '@/hooks/useAuth';

const STATUS_OPTIONS = [
  { value: '',           label: 'All Statuses'  },
  { value: 'scheduled',  label: 'Scheduled'     },
  { value: 'live',       label: 'Live'          },
  { value: 'half_time',  label: 'Half Time'     },
  { value: 'completed',  label: 'Completed'     },
  { value: 'postponed',  label: 'Postponed'     },
  { value: 'cancelled',  label: 'Cancelled'     },
];

const GROUP_OPTIONS = [
  { value: 'round', label: 'Group by Round' },
  { value: 'date',  label: 'Group by Date'  },
  { value: 'none',  label: 'No Grouping'    },
];

const VIEW_OPTIONS = [
  { value: 'row',  label: 'List'  },
  { value: 'card', label: 'Cards' },
];

function MatchesContent({ tournamentId }) {
  const { user }                         = useAuth();
  const { tournament, loading: tLoading } = useTournament(tournamentId);
  const {
    matches, live, upcoming, finished,
    loading, error, refresh,
    filters, setFilters, roundNames,
  } = useMatches(tournamentId);

  const isOwner = !!user && tournament?.owner_id === user.id;

  const [groupBy,       setGroupBy]       = useState('round');
  const [view,          setView]          = useState('row');
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const roundOptions = [
    { value: '', label: 'All Rounds' },
    ...roundNames.map((r) => ({ value: r, label: r })),
  ];

  const hasFilters = filters.status || filters.round_name || filters.search;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT_MATCH(tournamentId, deleteTarget.id), {
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
        <TournamentHeader tournament={tournament} isOwner={isOwner} activeTab="Matches" />
      </div>

      <div className="space-y-6 animate-fade-in">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Fixtures</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? 'Loading…' : `${matches.length} match${matches.length !== 1 ? 'es' : ''} total`}
            </p>
          </div>
          {isOwner && (
            <Button
              href={ROUTES.MATCH_CREATE ? ROUTES.MATCH_CREATE(tournamentId) : `${ROUTES.MATCHES(tournamentId)}/create`}
              size="sm"
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              }
            >
              Schedule Match
            </Button>
          )}
        </div>

        {/* Quick stats */}
        {!loading && matches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Upcoming',  value: upcoming.length,  color: 'bg-blue-50',   text: 'text-blue-600'  },
              { label: 'Live',      value: live.length,      color: 'bg-red-50',    text: 'text-red-600'   },
              { label: 'Completed', value: finished.length,  color: 'bg-green-50',  text: 'text-green-600' },
              { label: 'Total',     value: matches.length,   color: 'bg-slate-50',  text: 'text-slate-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
                <p className={`font-display text-2xl font-extrabold ${s.text}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters bar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                placeholder="Search by team name…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            <div className="w-full sm:w-40">
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              />
            </div>
            {roundNames.length > 0 && (
              <div className="w-full sm:w-44">
                <Select
                  options={roundOptions}
                  value={filters.round_name}
                  onChange={(e) => setFilters((f) => ({ ...f, round_name: e.target.value }))}
                />
              </div>
            )}
            <div className="w-full sm:w-40">
              <Select
                options={GROUP_OPTIONS}
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-32">
              <Select
                options={VIEW_OPTIONS}
                value={view}
                onChange={(e) => setView(e.target.value)}
              />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters({ status: '', round_name: '', search: '' })}
                className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap self-center"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Live matches callout */}
        {!loading && live.length > 0 && !filters.status && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <p className="text-sm font-semibold text-red-700">
              {live.length} match{live.length > 1 ? 'es' : ''} happening right now
            </p>
          </div>
        )}

        {/* Fixture list */}
        {loading ? (
          <SectionSpinner message="Loading fixtures…" />
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>Retry</Button>
          </div>
        ) : (
          <FixtureList
            matches={matches}
            tournamentId={tournamentId}
            isOwner={isOwner}
            onDelete={setDeleteTarget}
            groupBy={groupBy}
            view={view}
            emptyTitle={hasFilters ? 'No matches found' : 'No matches scheduled yet'}
            emptyMessage={
              hasFilters
                ? 'Try adjusting your filters.'
                : isOwner
                ? 'Schedule the first match to get the tournament going.'
                : 'Check back later for fixtures.'
            }
          />
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Match"
        message={
          deleteTarget
            ? `Permanently delete the fixture between ${deleteTarget.home_team_name} and ${deleteTarget.away_team_name}?`
            : ''
        }
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

export default function MatchesPage({ params }) {
  return <ProtectedRoute><MatchesContent tournamentId={params.id} /></ProtectedRoute>;
}