// src/app/dashboard/page.js

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { StatCard } from '@/components/ui/Card';
import Badge, { LiveBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SectionSpinner } from '@/components/ui/Spinner';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { ConfirmModal } from '@/components/ui/Modal';
import { ROUTES, API, TOURNAMENT_STATUS_LABELS, TOURNAMENT_TYPE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/helpers';
import useAuth from '@/hooks/useAuth';

// ── Dashboard data hook ───────────────────────────────────────────────────────
function useDashboardData() {
  const [tournaments,   setTournaments]   = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all user tournaments
      const res  = await fetch(API.TOURNAMENTS, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load.');

      const list = data.tournaments || [];
      setTournaments(list);

      // Derive stats client-side from the list
      setStats({
        total:     list.length,
        active:    list.filter((t) => t.status === 'active').length,
        upcoming:  list.filter((t) => t.status === 'upcoming').length,
        completed: list.filter((t) => t.status === 'completed').length,
        draft:     list.filter((t) => t.status === 'draft').length,
        teams:     list.reduce((sum, t) => sum + (t.team_count  || 0), 0),
        matches:   list.reduce((sum, t) => sum + (t.match_count || 0), 0),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { tournaments, stats, loading, error, refresh: load };
}

// ── Main content ──────────────────────────────────────────────────────────────
function DashboardContent() {
  const { user, logout, firstName, initials } = useAuth();
  const { tournaments, stats, loading, error, refresh } = useDashboardData();

  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError,   setDeleteError]   = useState('');

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  // Recent 3 tournaments
  const recentTournaments = tournaments.slice(0, 3);
  // Active tournaments
  const activeTournaments = tournaments.filter((t) => t.status === 'active');

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res  = await fetch(API.TOURNAMENT(deleteTarget.id), { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDeleteError(data.message || 'Delete failed.');
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
      <div className="space-y-7 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {greeting}, {firstName}! 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here's an overview of all your tournaments.
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

        {/* ── User card ── */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-brand">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold font-display border-2 border-white/30 shrink-0 select-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base leading-tight truncate">{user?.full_name}</p>
              <p className="text-blue-100 text-sm truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold capitalize">
                  {user?.role}
                </span>
                {user?.created_at && (
                  <span className="text-blue-200 text-xs">
                    Member since {formatDate(user.created_at)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors border border-white/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-1.07a.75.75 0 10-1.04-1.08l-2.5 2.5a.75.75 0 000 1.08l2.5 2.5a.75.75 0 101.04-1.08L8.704 10.75H18.25A.75.75 0 0019 10z" clipRule="evenodd" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* ── Stats grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl h-28 animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              label="Total Tournaments"
              value={stats.total}
              caption={`${stats.active} active`}
              iconColor="bg-blue-50"
              iconText="text-blue-600"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatCard
              label="Active Now"
              value={stats.active}
              caption={`${stats.upcoming} upcoming`}
              iconColor="bg-green-50"
              iconText="text-green-600"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              }
            />
            <StatCard
              label="Teams Registered"
              value={stats.teams}
              caption="Across all tournaments"
              iconColor="bg-purple-50"
              iconText="text-purple-600"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              }
            />
            <StatCard
              label="Matches Scheduled"
              value={stats.matches}
              caption={`${stats.completed} completed`}
              iconColor="bg-orange-50"
              iconText="text-orange-600"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
              }
            />
          </div>
        ) : null}

        {/* ── Active tournaments ── */}
        {!loading && activeTournaments.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">Active Tournaments</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {activeTournaments.length} running
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeTournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  isOwner
                  onDelete={setDeleteTarget}
                  view="grid"
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent tournaments ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-slate-900">My Tournaments</h2>
            <Link href={ROUTES.TOURNAMENTS} className="text-sm text-blue-600 font-medium hover:underline">
              View all →
            </Link>
          </div>

          {loading ? (
            <SectionSpinner message="Loading tournaments…" />
          ) : error ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button variant="secondary" size="sm" onClick={refresh}>Try Again</Button>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl">
              <EmptyState
                title="No tournaments yet"
                message="Create your first tournament to start managing teams, matches and live scores."
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                    <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                  </svg>
                }
                action={
                  <Button href={ROUTES.TOURNAMENT_CREATE} size="sm">
                    Create your first tournament
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Tournament</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">Teams</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Dates</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTournaments.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm border border-blue-100 shrink-0 overflow-hidden">
                            {t.logo_url
                              ? <img src={t.logo_url} alt={t.name} className="w-full h-full object-cover" />
                              : <span>🏆</span>
                            }
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-[160px]">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden sm:table-cell">
                        {TOURNAMENT_TYPE_LABELS[t.tournament_type] ?? t.tournament_type}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <Badge status={t.status} dot size="xs">
                          {TOURNAMENT_STATUS_LABELS[t.status] ?? t.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">
                        {t.team_count ?? 0}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs hidden lg:table-cell">
                        {formatDate(t.start_date)} – {formatDate(t.end_date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={ROUTES.TOURNAMENT(t.id)} className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap">
                            Open →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tournaments.length > 3 && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                  <Link href={ROUTES.TOURNAMENTS} className="text-xs font-semibold text-blue-600 hover:underline">
                    View all {tournaments.length} tournaments →
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Status breakdown ── */}
        {!loading && stats && stats.total > 0 && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Draft',     count: stats.draft,     status: 'draft',     color: 'bg-slate-100 text-slate-600' },
              { label: 'Upcoming',  count: stats.upcoming,  status: 'upcoming',  color: 'bg-blue-50 text-blue-600' },
              { label: 'Active',    count: stats.active,    status: 'active',    color: 'bg-green-50 text-green-600' },
              { label: 'Completed', count: stats.completed, status: 'completed', color: 'bg-slate-50 text-slate-500' },
            ].map((item) => (
              <Link
                key={item.status}
                href={`${ROUTES.TOURNAMENTS}?status=${item.status}`}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-150 text-center group"
              >
                <p className={`font-display text-2xl font-extrabold ${item.color.split(' ')[1]}`}>
                  {item.count}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{item.label}</p>
              </Link>
            ))}
          </section>
        )}

        {/* ── Phase notice ── */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">Phase 3 — Tournament Management complete ✓</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Tournaments are fully wired to the database. Team management, player rosters, match scheduling and live scoring are coming in Phases 4 & 5.
            </p>
          </div>
        </div>

      </div>

      {/* ── Delete confirmation ── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Tournament"
        message={
          deleteTarget
            ? `Permanently delete "${deleteTarget.name}"? All teams, players, and matches will be removed. This cannot be undone.`
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}