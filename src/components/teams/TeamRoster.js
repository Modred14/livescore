// src/components/teams/TeamRoster.js

'use client';

import Link from 'next/link';
import { ROUTES, PLAYER_POSITION_LABELS } from '@/lib/constants';

const POSITION_STYLES = {
  goalkeeper: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', abbr: 'GK' },
  defender:   { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200',   abbr: 'DEF' },
  midfielder: { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200',  abbr: 'MID' },
  forward:    { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200',    abbr: 'FWD' },
};

const POSITION_ORDER = ['goalkeeper', 'defender', 'midfielder', 'forward'];

/**
 * TeamRoster — grouped squad list sorted by position then jersey number.
 * Props:
 *   players       — array of player objects
 *   tournamentId  — for building edit links
 *   teamId        — for building edit links
 *   isOwner       — show edit/delete actions
 *   onDelete      — callback(player)
 */
export default function TeamRoster({
  players      = [],
  tournamentId,
  teamId,
  isOwner      = false,
  onDelete,
}) {
  if (!players.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-slate-400">
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-600 mb-1">No players yet</h3>
        <p className="text-xs text-slate-400">Add players to build the squad roster.</p>
      </div>
    );
  }

  // Group by position in display order
  const grouped = POSITION_ORDER.reduce((acc, pos) => {
    const group = players.filter((p) => p.position === pos);
    if (group.length) acc[pos] = group.sort((a, b) => a.jersey_number - b.jersey_number);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([position, group]) => {
        const style = POSITION_STYLES[position] ?? POSITION_STYLES.midfielder;
        const label = PLAYER_POSITION_LABELS[position] ?? position;

        return (
          <div key={position}>
            {/* Position header */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                {style.abbr}
              </span>
              <h3 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider">
                {label}s <span className="text-slate-400 font-normal">({group.length})</span>
              </h3>
            </div>

            {/* Player rows */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 w-14">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Player</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">Position</th>
                    {isOwner && <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.map((player) => (
                    <tr key={player.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Jersey number */}
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold border ${style.bg} ${style.text} ${style.border}`}>
                          {player.jersey_number}
                        </div>
                      </td>

                      {/* Player info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 overflow-hidden">
                            {player.photo_url
                              ? <img src={player.photo_url} alt={player.full_name} className="w-full h-full object-cover" />
                              : <span>{player.full_name.charAt(0).toUpperCase()}</span>
                            }
                          </div>
                          <span className="font-medium text-slate-800">{player.full_name}</span>
                        </div>
                      </td>

                      {/* Position label */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                          {label}
                        </span>
                      </td>

                      {/* Actions */}
                      {isOwner && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link
                              href={ROUTES.TEAM_PLAYER_EDIT(tournamentId, teamId, player.id)}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => onDelete?.(player)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}