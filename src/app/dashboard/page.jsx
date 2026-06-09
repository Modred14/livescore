// src/app/dashboard/page.js

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { StatCard, EmptyCard } from '@/components/ui/Card';
import Badge, { LiveBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard',
};

/* ── Mock data (replaced by real DB queries in Phase 2+) ─────────────────── */
const MOCK_STATS = [
  {
    label:     'Active Tournaments',
    value:     3,
    caption:   '2 in progress',
    iconColor: 'bg-blue-50',
    iconText:  'text-blue-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label:     'Total Teams',
    value:     24,
    caption:   'Across all tournaments',
    iconColor: 'bg-green-50',
    iconText:  'text-green-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
      </svg>
    ),
  },
  {
    label:     'Matches Played',
    value:     87,
    caption:   '+12 this week',
    trend:     '+16%',
    trendDir:  'up',
    iconColor: 'bg-orange-50',
    iconText:  'text-orange-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label:     'Goals Recorded',
    value:     214,
    caption:   'Avg 2.46 per match',
    iconColor: 'bg-purple-50',
    iconText:  'text-purple-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    ),
  },
];

const MOCK_TOURNAMENTS = [
  { id: '1', name: 'Lagos Premier League',    status: 'active',    teams: 10, matchday: 8  },
  { id: '2', name: 'Abuja Cup 2025',          status: 'upcoming',  teams: 8,  matchday: 0  },
  { id: '3', name: 'Port Harcourt 5-a-Side',  status: 'completed', teams: 6,  matchday: 10 },
];

const MOCK_LIVE = [
  { id: '1', home: 'Eagles FC',  away: 'Lions United', homeScore: 2, awayScore: 1, minute: 74 },
  { id: '2', home: 'Rovers SC',  away: 'City Boys FC', homeScore: 0, awayScore: 0, minute: 31 },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back! Here's what's happening across your tournaments.
            </p>
          </div>
          <Button href={ROUTES.TOURNAMENT_CREATE} size="sm" leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          }>
            New Tournament
          </Button>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {MOCK_STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Live matches ── */}
        {MOCK_LIVE.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-bold text-slate-900">Live Now</h2>
              <LiveBadge />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MOCK_LIVE.map((match) => (
                <Link
                  key={match.id}
                  href="#"
                  className="block bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-150 overflow-hidden"
                >
                  {/* Live bar */}
                  <div className="h-1 bg-red-500 w-full" />
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Live match
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {match.minute}'
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex-1 text-sm font-semibold text-slate-800 text-right truncate">
                        {match.home}
                      </span>
                      <span className="font-display text-2xl font-extrabold text-slate-900 shrink-0 tabular-nums">
                        {match.homeScore} — {match.awayScore}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-slate-800 text-left truncate">
                        {match.away}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── My Tournaments ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-slate-900">My Tournaments</h2>
            <Link
              href={ROUTES.TOURNAMENTS}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View all →
            </Link>
          </div>

          {MOCK_TOURNAMENTS.length === 0 ? (
            <Card padding={false}>
              <EmptyCard
                title="No tournaments yet"
                message="Create your first tournament to get started."
                action={
                  <Button href={ROUTES.TOURNAMENT_CREATE} size="sm">
                    Create tournament
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tournament
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      Teams
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      Matchday
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_TOURNAMENTS.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {t.name}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <Badge status={t.status} dot size="sm">
                          {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">
                        {t.teams} teams
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell">
                        MD {t.matchday}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={ROUTES.TOURNAMENT(t.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Phase notice ── */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-500 shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-800">Phase 1 — Foundation complete</p>
            <p className="text-xs text-blue-600 mt-0.5">
              This dashboard shows placeholder data. Authentication, tournament management, and live scoring will be wired up in Phases 2–5.
            </p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}