// src/app/tournaments/[id]/matches/[matchId]/live/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LiveScoreboard from '@/components/live/LiveScoreboard';
import MatchTimer from '@/components/live/MatchTimer';
import MatchTimeline from '@/components/live/MatchTimeline';
import MatchControls from '@/components/live/MatchControls';
import EventForm from '@/components/live/EventForm';
import LiveMatchStats from '@/components/live/LiveMatchStats';
import { ConfirmModal } from '@/components/ui/Modal';
import { SectionSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import useLiveMatch from '@/hooks/useLiveMatch';
import Link from 'next/link';

function LiveAdminContent({ tournamentId, matchId }) {
  const {
    match, events, squads, stats,
    loading, error, lastPoll,
    isOwner, isLive, isDone,
    transitionStatus, addEvent, removeEvent,
  } = useLiveMatch(tournamentId, matchId);

  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const result = await removeEvent(deleteTarget.id);
      if (!result?.success) {
        setDeleteError(result?.message || 'Failed to remove event.');
        return;
      }
      setDeleteTarget(null);
    } catch {
      setDeleteError('A network error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <SectionSpinner message="Loading live match…" />
    </DashboardLayout>
  );

  if (error || !match) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500 text-sm">{error || 'Match not found.'}</p>
        <Button href={ROUTES.MATCHES(tournamentId)} variant="secondary" size="sm">
          Back to Matches
        </Button>
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
          <p className="text-sm text-slate-500 mt-1">Only the tournament owner can access the live admin panel.</p>
        </div>
        <div className="flex gap-3">
          <Button href={ROUTES.MATCH(tournamentId, matchId)} variant="secondary" size="sm">View Match</Button>
          <Button href={ROUTES.MATCHES(tournamentId)} variant="neutral" size="sm">All Matches</Button>
        </div>
      </div>
    </DashboardLayout>
  );

  const canAddEvents = isLive;
  const recentGoals  = events.filter((e) =>
    ['goal','own_goal','penalty_goal'].includes(e.event_type)
  ).slice(-3);

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-fade-in">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                ADMIN PANEL
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Live Match Control
            </h1>
            <p className="text-sm text-slate-500">
              {match.home_team_name} vs {match.away_team_name}
              {lastPoll && (
                <span className="ml-2 text-slate-400 text-xs">
                  · Last updated {lastPoll.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.MATCH_EVENTS ? ROUTES.MATCH_EVENTS(tournamentId, matchId) : `${ROUTES.MATCH(tournamentId, matchId)}/events`}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Public view →
            </Link>
            <Button href={ROUTES.MATCH(tournamentId, matchId)} variant="neutral" size="sm">
              Match Page
            </Button>
          </div>
        </div>

        {/* Scoreboard */}
        <LiveScoreboard match={match} />

        {/* Timer + Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Timer */}
          <div className="bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
            <MatchTimer
              status={match.status}
              matchTime={match.match_time}
              events={events}
            />
          </div>

          {/* Controls (spans 2 cols) */}
          <div className="md:col-span-2">
            <MatchControls
              match={match}
              onTransition={transitionStatus}
              disabled={isDone}
            />
          </div>
        </div>

        {/* Main grid: Event Form + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Event form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 text-sm">Add Event</h3>
                {!canAddEvents && (
                  <span className="text-xs text-slate-400 font-medium">
                    {isDone ? 'Match ended' : 'Start match first'}
                  </span>
                )}
              </div>

              {canAddEvents ? (
                <div className="p-5">
                  <EventForm
                    match={match}
                    squads={squads}
                    onSubmit={addEvent}
                  />
                </div>
              ) : (
                <div className="p-5 text-center text-slate-400 text-sm">
                  {isDone
                    ? 'Match has ended. No more events can be added.'
                    : 'Start the match to begin recording events.'
                  }
                </div>
              )}
            </div>
          </div>

          {/* Timeline + stats */}
          <div className="lg:col-span-2 space-y-5">

            {/* Match Stats */}
            <LiveMatchStats stats={stats} match={match} />

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-800 text-sm">
                  Timeline
                  <span className="ml-2 text-slate-400 font-normal">({events.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Hover to delete</span>
              </div>
              <div className="p-5">
                <MatchTimeline
                  events={events}
                  homeTeamId={match.home_team_id}
                  isOwner={isOwner}
                  onDelete={setDeleteTarget}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete event confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteEvent}
        loading={deleteLoading}
        title="Remove Event"
        message={
          deleteTarget
            ? `Remove the ${deleteTarget.event_type.replace(/_/g, ' ')} event at ${deleteTarget.minute}'? ${['goal','own_goal','penalty_goal'].includes(deleteTarget.event_type) ? 'The score will be automatically adjusted.' : ''}`
            : ''
        }
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

export default function LiveMatchPage({ params }) {
  return (
    <ProtectedRoute>
      <LiveAdminContent tournamentId={params.id} matchId={params.matchId} />
    </ProtectedRoute>
  );
}