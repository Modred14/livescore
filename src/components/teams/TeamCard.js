// src/components/teams/TeamCard.js

'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

/**
 * TeamCard — displays a team summary.
 * view: 'grid' | 'list'
 */

const POSITION_COLORS = {
  goalkeeper: 'bg-yellow-100 text-yellow-800',
  defender:   'bg-blue-100   text-blue-800',
  midfielder: 'bg-green-100  text-green-800',
  forward:    'bg-red-100    text-red-800',
};

export default function TeamCard({
  team,
  tournamentId,
  isOwner  = false,
  onDelete,
  view     = 'grid',
}) {
  if (!team) return null;

  const { id, name, logo_url, coach_name, player_count = 0 } = team;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (view === 'list') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 p-4">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0 overflow-hidden">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{initials}</span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={ROUTES.TEAM(tournamentId, id)}
              className="font-display font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
            >
              {name}
            </Link>
            {coach_name && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">Coach: {coach_name}</p>
            )}
          </div>

          {/* Player count */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-400">
              <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
            </svg>
            <span><strong className="text-slate-700">{player_count}</strong> players</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={ROUTES.TEAM(tournamentId, id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              View
            </Link>
            {isOwner && (
              <>
                <Link
                  href={ROUTES.TEAM_EDIT(tournamentId, id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete?.(team)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Grid view ──────────────────────────────────────────────────────────────
  return (
    <div className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-blue-600 w-full" />

      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-4">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0 overflow-hidden shadow-sm">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{initials}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={ROUTES.TEAM(tournamentId, id)}
              className="block font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight text-lg"
            >
              {name}
            </Link>
            {coach_name && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                {coach_name}
              </p>
            )}
          </div>
        </div>

        {/* Player count badge */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-blue-400">
            <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
          </svg>
          <span><strong className="text-slate-800">{player_count}</strong> {player_count === 1 ? 'player' : 'players'}</span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <Link
          href={ROUTES.TEAM(tournamentId, id)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View Squad →
        </Link>
        {isOwner && (
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.TEAM_EDIT(tournamentId, id)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Edit
            </Link>
            <span className="text-slate-200">|</span>
            <button
              type="button"
              onClick={() => onDelete?.(team)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}