// src/components/tournaments/TournamentHeader.js

'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROUTES, TOURNAMENT_TYPE_LABELS, TOURNAMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/helpers';

const TYPE_ICONS = {
  league:      '🏆',
  knockout:    '⚡',
  group_stage: '🎯',
  round_robin: '🔄',
};

const NAV_TABS = [
  { label: 'Overview',  href: (id) => ROUTES.TOURNAMENT(id) },
  { label: 'Teams',     href: (id) => ROUTES.TEAMS(id) },
  { label: 'Players',   href: (id) => ROUTES.PLAYERS(id) },
  { label: 'Matches',   href: (id) => ROUTES.MATCHES(id) },
  { label: 'Standings', href: (id) => ROUTES.STANDINGS(id) },
  { label: 'Bracket',   href: (id) => ROUTES.BRACKET(id) },
];

/**
 * TournamentHeader — full-width banner with logo, title, meta, tabs and actions.
 *
 * Props:
 *   tournament  — full tournament object
 *   isOwner     — show edit/delete actions
 *   onDelete    — callback for delete action
 *   activeTab   — current tab label (for active styling)
 */
export default function TournamentHeader({
  tournament,
  isOwner   = false,
  onDelete,
  activeTab = 'Overview',
}) {
  if (!tournament) return null;

  const {
    id, name, description, logo_url, tournament_type,
    location, start_date, end_date, status,
    owner_name, team_count = 0, match_count = 0,
  } = tournament;

  const typeIcon  = TYPE_ICONS[tournament_type] ?? '🏅';
  const typeLabel = TOURNAMENT_TYPE_LABELS[tournament_type] ?? tournament_type;

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      {/* ── Main banner ── */}
      <div className="container-app pt-6 pb-0">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
          <Link href={ROUTES.DASHBOARD} className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <Link href={ROUTES.TOURNAMENTS} className="hover:text-blue-600 transition-colors">My Tournaments</Link>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
          <span className="text-slate-600 font-medium truncate max-w-[160px]">{name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row items-start gap-5 pb-5">
          {/* Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-sm">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{typeIcon}</span>
            }
          </div>

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {name}
              </h1>
              <Badge status={status} dot size="md">
                {TOURNAMENT_STATUS_LABELS[status] ?? status}
              </Badge>
            </div>

            {description && (
              <p className="text-sm text-slate-500 mb-2 line-clamp-2">{description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z" clipRule="evenodd" /></svg>
                {typeLabel}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.16 3.44 6.66 4.14 7.33a.5.5 0 0 0 .72 0C9.06 12.66 12.5 9.16 12.5 6A4.5 4.5 0 0 0 8 1.5ZM8 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" /></svg>
                  {location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4 1a.75.75 0 0 1 .75.75V3h6.5V1.75a.75.75 0 0 1 1.5 0V3A2 2 0 0 1 14 5v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75A.75.75 0 0 1 4 1Z" /></svg>
                {formatDate(start_date)} – {formatDate(end_date)}
              </span>
              {owner_name && (
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                  by {owner_name}
                </span>
              )}
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" /></svg>
                {team_count} {team_count === 1 ? 'Team' : 'Teams'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5l-1.22 1.22a.75.75 0 1 0 1.06 1.06l1.47-1.47a.75.75 0 0 0 .19-.51v-3.8Z" clipRule="evenodd" /></svg>
                {match_count} {match_count === 1 ? 'Match' : 'Matches'}
              </span>
            </div>
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0 self-start">
              <Button href={ROUTES.TOURNAMENT_EDIT(id)} variant="secondary" size="sm"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.263a1.75 1.75 0 0 0 0-2.474Z" />
                    <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                  </svg>
                }>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete?.(tournament)}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.712Z" clipRule="evenodd" />
                  </svg>
                }>
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* ── Navigation tabs ── */}
        <nav className="flex items-center gap-0 -mb-px overflow-x-auto no-scrollbar" aria-label="Tournament sections">
          {NAV_TABS.map((tab) => {
            const isActive = tab.label === activeTab;
            return (
              <Link
                key={tab.label}
                href={tab.href(id)}
                className={[
                  'whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}