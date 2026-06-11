// src/components/players/PlayerCard.js

'use client';

import Link from 'next/link';
import { ROUTES, PLAYER_POSITION_LABELS } from '@/lib/constants';

const POSITION_STYLES = {
  goalkeeper: { bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  defender:   { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  midfielder: { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  forward:    { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
};

/**
 * PlayerCard — individual player display tile.
 * view: 'grid' | 'list'
 */
export default function PlayerCard({
  player,
  tournamentId,
  teamId,
  isOwner  = false,
  onDelete,
  view     = 'list',
}) {
  if (!player) return null;

  const { id, full_name, jersey_number, position, photo_url, team_name } = player;
  const tid    = teamId ?? player.team_id;
  const style  = POSITION_STYLES[position] ?? POSITION_STYLES.midfielder;
  const label  = PLAYER_POSITION_LABELS[position] ?? position;
  const initials = full_name.charAt(0).toUpperCase();

  if (view === 'grid') {
    return (
      <div className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden">
        {/* Top accent */}
        <div className={`h-1 w-full ${style.dot.replace('bg-', 'bg-')}`} />

        <div className="p-4 text-center">
          {/* Photo */}
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 ${style.border} ${style.bg}`}>
            {photo_url
              ? <img src={photo_url} alt={full_name} className="w-full h-full object-cover" />
              : <span className={style.text}>{initials}</span>
            }
          </div>

          {/* Jersey */}
          <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border -mt-1 mb-2 ${style.bg} ${style.text} ${style.border}`}>
            {jersey_number}
          </div>

          <h3 className="font-display font-bold text-slate-900 text-sm leading-tight mb-1">{full_name}</h3>

          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
            {label}
          </span>

          {team_name && (
            <p className="text-xs text-slate-400 mt-1.5 truncate">{team_name}</p>
          )}
        </div>

        {isOwner && (
          <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60 flex items-center justify-center gap-4">
            <Link
              href={ROUTES.TEAM_PLAYER_EDIT(tournamentId, tid, id)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Edit
            </Link>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => onDelete?.(player)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 px-4 py-3">
      <div className="flex items-center gap-3">
        {/* Jersey badge */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0 ${style.bg} ${style.text} ${style.border}`}>
          {jersey_number}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0 overflow-hidden">
          {photo_url
            ? <img src={photo_url} alt={full_name} className="w-full h-full object-cover" />
            : <span>{initials}</span>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{full_name}</p>
          {team_name && <p className="text-xs text-slate-400 truncate">{team_name}</p>}
        </div>

        {/* Position */}
        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border shrink-0 ${style.bg} ${style.text} ${style.border}`}>
          {label}
        </span>

        {/* Actions */}
        {isOwner && (
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Link
              href={ROUTES.TEAM_PLAYER_EDIT(tournamentId, tid, id)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete?.(player)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}