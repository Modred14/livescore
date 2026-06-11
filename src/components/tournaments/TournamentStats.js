// src/components/tournaments/TournamentStats.js

'use client';

import { StatCard } from '@/components/ui/Card';

/**
 * TournamentStats — renders a row of stat cards for a tournament detail page.
 * Updated in Phase 4 to include team_count and player_count.
 */
export default function TournamentStats({ tournament }) {
  if (!tournament) return null;

  const {
    team_count        = 0,
    match_count       = 0,
    completed_matches = 0,
    live_matches      = 0,
    player_count      = 0,
  } = tournament;

  const upcoming_matches = Math.max(0, match_count - completed_matches - live_matches);

  const stats = [
    {
      label:     'Teams',
      value:     team_count,
      caption:   team_count === 1 ? '1 team registered' : `${team_count} teams registered`,
      iconColor: 'bg-blue-50',
      iconText:  'text-blue-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
        </svg>
      ),
    },
    {
      label:     'Players',
      value:     player_count,
      caption:   team_count > 0
        ? `Avg ${team_count > 0 ? Math.round(player_count / team_count) : 0} per team`
        : 'No teams yet',
      iconColor: 'bg-purple-50',
      iconText:  'text-purple-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:     'Total Matches',
      value:     match_count,
      caption:   `${completed_matches} completed`,
      iconColor: 'bg-green-50',
      iconText:  'text-green-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label:     'Live Now',
      value:     live_matches,
      caption:   live_matches > 0 ? 'In progress' : upcoming_matches > 0 ? `${upcoming_matches} upcoming` : 'No live games',
      iconColor: live_matches > 0 ? 'bg-red-50'    : 'bg-slate-50',
      iconText:  live_matches > 0 ? 'text-red-600' : 'text-slate-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
          <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}