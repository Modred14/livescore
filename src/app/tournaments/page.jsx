// src/app/tournaments/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentCard from '@/components/tournaments/TournamentCard';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import { SectionSpinner } from '@/components/ui/Spinner';
import { ConfirmModal } from '@/components/ui/Modal';
import { ROUTES, TOURNAMENT_TYPE_LABELS, TOURNAMENT_STATUS_LABELS, API } from '@/lib/constants';
import { useTournaments } from '@/hooks/useTournament';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(TOURNAMENT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  ...Object.entries(TOURNAMENT_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

function TournamentsContent() {
  const router = useRouter();
  const { tournaments, loading, error, refresh, filters, setFilters } = useTournaments();

  const [view,            setView]            = useState('grid');   // 'grid' | 'list'
  const [deleteTarget,    setDeleteTarget]    = useState(null);
  const [deleteLoading,   setDeleteLoading]   = useState(false);
  const [deleteError,     setDeleteError]     = useState('');

  // ── Filter handlers ──────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const clearFilters = () => setFilters({ status: '', tournament_type: '', search: '' });

  const hasActiveFilters = filters.status || filters.tournament_type || filters.search;

  // ── Delete flow ──────────────────────────────────────────────────────────
  const handleDeleteRequest = (tournament) => {
    setDeleteTarget(tournament);
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT(deleteTarget.id), {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.message || 'Delete failed. Please try again.');
        return;
      }
      setDeleteTarget(null);
      refresh();
    } catch {
      setDeleteError('A network error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">My Tournaments</h1>
            <p className="text-sm text-slate-500 mt-1">
              {loading ? 'Loading…' : `${tournaments.length} tournament${tournaments.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            href={ROUTES.TOURNAMENT_CREATE}
            size="sm"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            }
          >
            New Tournament
          </Button>
        </div>

        {/* ── Filters bar ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <SearchInput
                placeholder="Search tournaments…"
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                name="status"
                placeholder="All Statuses"
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={handleFilterChange}
              />
            </div>
            <div className="w-full sm:w-44">
              <Select
                name="tournament_type"
                placeholder="All Types"
                options={TYPE_OPTIONS}
                value={filters.tournament_type}
                onChange={handleFilterChange}
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
              {['grid', 'list'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={[
                    'px-3 py-2 transition-colors',
                    view === v ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50',
                  ].join(' ')}
                  aria-label={`${v} view`}
                  aria-pressed={view === v}
                >
                  {v === 'grid'
                    ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm6.5-9A2.25 2.25 0 008.5 4.25v2.5A2.25 2.25 0 0010.75 9h2.5A2.25 2.25 0 0015.5 6.75v-2.5A2.25 2.25 0 0013.25 2h-2.5zm0 9a2.25 2.25 0 00-2.25 2.25v2.5a2.25 2.25 0 002.25 2.25h2.5a2.25 2.25 0 002.25-2.25v-2.5a2.25 2.25 0 00-2.25-2.25h-2.5z" clipRule="evenodd" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" /></svg>
                  }
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-red-500 font-medium whitespace-nowrap transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <SectionSpinner message="Loading tournaments…" />
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <Button variant="secondary" size="sm" onClick={refresh}>Try Again</Button>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <EmptyState
              title={hasActiveFilters ? 'No matching tournaments' : 'No tournaments yet'}
              message={
                hasActiveFilters
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first tournament to get started tracking scores and standings.'
              }
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                </svg>
              }
              action={
                !hasActiveFilters && (
                  <Button href={ROUTES.TOURNAMENT_CREATE} size="sm">
                    Create your first tournament
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className={view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-3'
          }>
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                isOwner
                onDelete={handleDeleteRequest}
                view={view}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Tournament"
        message={
          deleteTarget
            ? `Are you sure you want to permanently delete "${deleteTarget.name}"? All teams, players, and match data will also be deleted. This cannot be undone.`
            : ''
        }
        confirmLabel="Yes, Delete"
        cancelLabel="Keep it"
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

export default function TournamentsPage() {
  return (
    <ProtectedRoute>
      <TournamentsContent />
    </ProtectedRoute>
  );
}