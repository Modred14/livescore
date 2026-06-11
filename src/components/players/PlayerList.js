// src/components/players/PlayerList.js

'use client';

import PlayerCard from './PlayerCard';
import EmptyState from '@/components/ui/EmptyState';
import Select from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/Input';
import { PLAYER_POSITION_LABELS } from '@/lib/constants';

const POSITION_FILTER_OPTIONS = [
  { value: '', label: 'All Positions' },
  ...Object.entries(PLAYER_POSITION_LABELS).map(([, label], i) => ({
    value: Object.keys(PLAYER_POSITION_LABELS)[i].toLowerCase() === 'gk' ? 'goalkeeper'
         : Object.keys(PLAYER_POSITION_LABELS)[i].toLowerCase() === 'def' ? 'defender'
         : Object.keys(PLAYER_POSITION_LABELS)[i].toLowerCase() === 'mid' ? 'midfielder'
         : 'forward',
    label,
  })),
];

// Simpler: build from known values
const POSITION_OPTIONS = [
  { value: '',           label: 'All Positions' },
  { value: 'goalkeeper', label: 'Goalkeepers'  },
  { value: 'defender',   label: 'Defenders'    },
  { value: 'midfielder', label: 'Midfielders'  },
  { value: 'forward',    label: 'Forwards'     },
];

/**
 * PlayerList — filterable player list with search + position filter.
 * Props:
 *   players      — array of player objects
 *   tournamentId — for links
 *   teamId       — for links (optional — uses player.team_id if absent)
 *   isOwner      — show edit/delete
 *   onDelete     — callback(player)
 *   filters      — { search, position }
 *   onFilter     — (updates) => void
 *   showTeam     — whether to show team column (for tournament-wide view)
 */
export default function PlayerList({
  players      = [],
  tournamentId,
  teamId,
  isOwner      = false,
  onDelete,
  filters      = { search: '', position: '' },
  onFilter,
  showTeam     = false,
}) {
  const hasFilters = filters.search || filters.position;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search players…"
            value={filters.search}
            onChange={(e) => onFilter?.({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={POSITION_OPTIONS}
            value={filters.position}
            onChange={(e) => onFilter?.({ ...filters, position: e.target.value })}
            placeholder="All Positions"
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => onFilter?.({ search: '', position: '' })}
            className="text-xs font-medium text-slate-500 hover:text-red-500 transition-colors whitespace-nowrap self-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      {players.length > 0 && (
        <p className="text-xs text-slate-400 font-medium">
          {players.length} player{players.length !== 1 ? 's' : ''}
          {hasFilters ? ' matching filters' : ''}
        </p>
      )}

      {/* List */}
      {players.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching players' : 'No players yet'}
          message={
            hasFilters
              ? 'Try adjusting your search or position filter.'
              : 'Add players to the squad to get started.'
          }
          compact
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122z" />
            </svg>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              tournamentId={tournamentId}
              teamId={teamId ?? player.team_id}
              isOwner={isOwner}
              onDelete={onDelete}
              view="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}