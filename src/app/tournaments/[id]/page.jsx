// src/app/tournaments/[id]/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TournamentHeader from '@/components/tournaments/TournamentHeader';
import TournamentStats from '@/components/tournaments/TournamentStats';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { ROUTES, API, TOURNAMENT_TYPE_LABELS, TOURNAMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/helpers';
import { useTournament } from '@/hooks/useTournament';

function TournamentDetailContent({ id }) {
  const router = useRouter();
  const { tournament, loading, error, refresh, isOwner } = useTournament(id);

  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT(id), { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.message || 'Delete failed.');
        return;
      }
      router.push(ROUTES.TOURNAMENTS);
      router.refresh();
    } catch {
      setDeleteError('A network error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <SectionSpinner message="Loading tournament…" />
    </DashboardLayout>
  );

  if (error || !tournament) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-slate-300">
          <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div className="text-center">
          <h2 className="font-display text-lg font-bold text-slate-700">Tournament not found</h2>
          <p className="text-sm text-slate-500 mt-1">{error || 'This tournament does not exist or you do not have access.'}</p>
        </div>
        <Button href={ROUTES.TOURNAMENTS} variant="secondary" size="sm">Back to Tournaments</Button>
      </div>
    </DashboardLayout>
  );

  const {
    name, description, tournament_type, location,
    start_date, end_date, status, created_at, updated_at,
    owner_name, owner_email, team_count = 0, match_count = 0,
  } = tournament;

  return (
    <DashboardLayout>
      {/* Full-width header outside the padded layout area */}
      <div className="-mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-8">
        <TournamentHeader
          tournament={tournament}
          isOwner={isOwner}
          onDelete={() => setDeleteOpen(true)}
          activeTab="Overview"
        />
      </div>

      <div className="space-y-6 animate-fade-in">

        {/* ── Stats ── */}
        <TournamentStats tournament={tournament} />

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: About ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {description && (
              <Card>
                <h2 className="font-display font-bold text-slate-800 text-base mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <h2 className="font-display font-bold text-slate-800 text-base mb-4">Manage Tournament</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Teams',     icon: '👥', href: ROUTES.TEAMS(id),     desc: `${team_count} registered` },
                  { label: 'Players',   icon: '🏃', href: ROUTES.PLAYERS(id),   desc: 'Manage rosters' },
                  { label: 'Matches',   icon: '⚽', href: ROUTES.MATCHES(id),   desc: `${match_count} scheduled` },
                  { label: 'Standings', icon: '📊', href: ROUTES.STANDINGS(id), desc: 'View table' },
                  { label: 'Bracket',   icon: '🔖', href: ROUTES.BRACKET(id),   desc: 'Knockout draw' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all duration-150 text-center group"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{item.label}</span>
                    <span className="text-xs text-slate-400">{item.desc}</span>
                  </a>
                ))}
                {isOwner && (
                  <a
                    href={ROUTES.TOURNAMENT_EDIT(id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all duration-150 text-center group"
                  >
                    <span className="text-2xl">✏️</span>
                    <span className="text-sm font-semibold text-blue-600">Edit</span>
                    <span className="text-xs text-blue-400">Update details</span>
                  </a>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Details sidebar ─────────────────────────────────────── */}
          <div className="space-y-5">
            <Card>
              <h2 className="font-display font-bold text-slate-800 text-base mb-4">Tournament Details</h2>
              <dl className="space-y-3.5">
                <DetailRow label="Status">
                  <Badge status={status} dot>
                    {TOURNAMENT_STATUS_LABELS[status] ?? status}
                  </Badge>
                </DetailRow>
                <DetailRow label="Type">
                  {TOURNAMENT_TYPE_LABELS[tournament_type] ?? tournament_type}
                </DetailRow>
                {location && (
                  <DetailRow label="Location">{location}</DetailRow>
                )}
                <DetailRow label="Start Date">{formatDate(start_date)}</DetailRow>
                <DetailRow label="End Date">{formatDate(end_date)}</DetailRow>
                <DetailRow label="Created">{formatDate(created_at)}</DetailRow>
                {updated_at && updated_at !== created_at && (
                  <DetailRow label="Last Updated">{formatDate(updated_at)}</DetailRow>
                )}
              </dl>
            </Card>

            <Card>
              <h2 className="font-display font-bold text-slate-800 text-base mb-4">Organiser</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {owner_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{owner_name}</p>
                  <p className="text-xs text-slate-400 truncate">{owner_email}</p>
                </div>
              </div>
              {isOwner && (
                <p className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6.5 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .714 1.7 1 1 0 0 0-.707.707.75.75 0 0 1-1.414-.4 2.5 2.5 0 0 1 1.407-1.407Z" clipRule="evenodd" />
                  </svg>
                  You own this tournament
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ── Delete modal ── */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Tournament"
        message={`Permanently delete "${name}"? All teams, players, and matches will be removed. This cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
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

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <dt className="text-slate-400 shrink-0 w-28">{label}</dt>
      <dd className="text-slate-700 font-medium text-right">{children}</dd>
    </div>
  );
}

export default function TournamentDetailPage({ params }) {
  return (
    <ProtectedRoute>
      <TournamentDetailContent id={params.id} />
    </ProtectedRoute>
  );
}
