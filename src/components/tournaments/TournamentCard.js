// src/components/tournaments/TournamentCard.js

'use client';

import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { ROUTES, TOURNAMENT_TYPE_LABELS, TOURNAMENT_STATUS_LABELS } from '@/lib/constants';
import { formatDate, statusBgColor } from '@/lib/helpers';

/**
 * TournamentCard — displays a tournament summary in a grid or list.
 *
 * Props:
 *   tournament — tournament object from DB/API
 *   isOwner    — show owner action buttons (edit/delete)
 *   onDelete   — callback when delete is requested
 *   view       — 'grid' | 'list'
 */

const TYPE_ICONS = {
  league:      '🏆',
  knockout:    '⚡',
  group_stage: '🎯',
  round_robin: '🔄',
};

const STATUS_ACCENT = {
  draft:     'border-l-slate-300',
  upcoming:  'border-l-blue-400',
  active:    'border-l-green-500',
  completed: 'border-l-slate-400',
};

export default function TournamentCard({
  tournament,
  isOwner  = false,
  onDelete,
  view     = 'grid',
}) {
  if (!tournament) return null;

  const {
    id, name, description, logo_url, tournament_type,
    location, start_date, end_date, status,
    team_count = 0, match_count = 0,
  } = tournament;

  const typeLabel   = TOURNAMENT_TYPE_LABELS[tournament_type]   ?? tournament_type;
  const statusLabel = TOURNAMENT_STATUS_LABELS[status]          ?? status;
  const typeIcon    = TYPE_ICONS[tournament_type]                ?? '🏅';
  const accentClass = STATUS_ACCENT[status]                     ?? 'border-l-slate-300';

  if (view === 'list') {
    return (
      <div className={`bg-white border border-slate-200 border-l-4 ${accentClass} rounded-xl shadow-sm hover:shadow-md transition-all duration-150 p-4`}>
        <div className="flex items-center gap-4">
          {/* Logo / icon */}
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-blue-100">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{typeIcon}</span>
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={ROUTES.TOURNAMENT(id)} className="font-display font-bold text-slate-900 hover:text-blue-600 transition-colors truncate">
                {name}
              </Link>
              <Badge status={status} dot size="xs">{statusLabel}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
              <span>{typeLabel}</span>
              {location && <><span>·</span><span>{location}</span></>}
              <span>·</span>
              <span>{formatDate(start_date)} – {formatDate(end_date)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-5 text-center shrink-0">
            <div>
              <p className="font-display font-bold text-slate-900 text-lg leading-none">{team_count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Teams</p>
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 text-lg leading-none">{match_count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Matches</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={ROUTES.TOURNAMENT(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Open
            </Link>
            {isOwner && (
              <>
                <Link
                  href={ROUTES.TOURNAMENT_EDIT(id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onDelete?.(tournament)}
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

  // ── Grid view (default) ──────────────────────────────────────────────────────
  return (
    <div className={`group bg-white border border-slate-200 border-t-4 ${accentClass.replace('border-l-', 'border-t-')} rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 flex flex-col overflow-hidden`}>
      {/* Card header */}
      <div className="p-5 flex-1">
        <div className="flex items-start gap-3 mb-3">
          {/* Logo / emoji */}
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl shrink-0 overflow-hidden border border-blue-100">
            {logo_url
              ? <img src={logo_url} alt={name} className="w-full h-full object-cover" />
              : <span>{typeIcon}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={ROUTES.TOURNAMENT(id)}
              className="block font-display font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2"
            >
              {name}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5">{typeLabel}</p>
          </div>
          <Badge status={status} dot size="xs">{statusLabel}</Badge>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{description}</p>
        )}

        {/* Meta */}
        <div className="space-y-1.5">
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                <path fillRule="evenodd" d="M8 1.5A4.5 4.5 0 0 0 3.5 6c0 3.16 3.44 6.66 4.14 7.33a.5.5 0 0 0 .72 0C9.06 12.66 12.5 9.16 12.5 6A4.5 4.5 0 0 0 8 1.5ZM8 7.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
              <path d="M5.75 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM5 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM8 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM7.25 10.25a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM10.25 7.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4 1a.75.75 0 0 1 .75.75V3h6.5V1.75a.75.75 0 0 1 1.5 0V3A2 2 0 0 1 14 5v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75A.75.75 0 0 1 4 1Z" />
            </svg>
            <span>{formatDate(start_date)} – {formatDate(end_date)}</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-slate-400">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          <span><strong className="text-slate-700">{team_count}</strong> teams</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-slate-400">
            <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v3.5l-1.22 1.22a.75.75 0 1 0 1.06 1.06l1.47-1.47a.75.75 0 0 0 .19-.51v-3.8Z" clipRule="evenodd" />
          </svg>
          <span><strong className="text-slate-700">{match_count}</strong> matches</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={ROUTES.TOURNAMENT(id)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View →
          </Link>
          {isOwner && (
            <>
              <span className="text-slate-200">|</span>
              <Link href={ROUTES.TOURNAMENT_EDIT(id)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Edit
              </Link>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={() => onDelete?.(tournament)}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
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