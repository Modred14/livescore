// src/components/teams/TeamHeader.js

'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';

/**
 * TeamHeader — banner shown at top of team detail and roster pages.
 */
export default function TeamHeader({
  team,
  tournament,
  isOwner  = false,
  onDelete,
  activeTab = 'Squad',
}) {
  if (!team) return null;

  const { id, name, logo_url, coach_name, player_count = 0 } = team;
  const tournamentId = tournament?.id ?? team.tournament_id;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tabs = [
    { label: 'Squad',    href: ROUTES.TEAM(tournamentId, id) },
    ...(isOwner ? [{ label: 'Add Player', href: ROUTES.TEAM_PLAYER_CREATE(tournamentId, id) }] : []),
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container-app pt-6 pb-0">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <ChevronIcon />
          <Link href={ROUTES.TOURNAMENTS} className="hover:text-blue-600 transition-colors">Tournaments</Link>
          <ChevronIcon />
          <Link href={ROUTES.TOURNAMENT(tournamentId)} className="hover:text-blue-600 transition-colors truncate max-w-[100px]">
            {tournament?.name ?? 'Tournament'}
          </Link>
          <ChevronIcon />
          <Link href={ROUTES.TEAMS(tournamentId)} className="hover:text-blue-600 transition-colors">Teams</Link>
          <ChevronIcon />
          <span className="text-slate-600 font-medium truncate max-w-[120px]">{name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row items-start gap-5 pb-5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 shrink-0 overflow-hidden shadow-sm">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{initials}</span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-1">
              {name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mb-3">
              {coach_name && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                  </svg>
                  Coach: {coach_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                {player_count} {player_count === 1 ? 'Player' : 'Players'}
              </span>
            </div>

            {/* Tournament link */}
            {tournament && (
              <Link
                href={ROUTES.TOURNAMENT(tournamentId)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" />
                </svg>
                {tournament.name}
              </Link>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0 self-start">
              <Button
                href={ROUTES.TEAM_PLAYER_CREATE(tournamentId, id)}
                size="sm"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                  </svg>
                }
              >
                Add Player
              </Button>
              <Button
                href={ROUTES.TEAM_EDIT(tournamentId, id)}
                variant="secondary"
                size="sm"
              >
                Edit Team
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete?.(team)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-0 -mb-px overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={[
                'whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150',
                activeTab === tab.label
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}