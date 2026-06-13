// src/components/matches/FixtureList.js

'use client';

import MatchCard from './MatchCard';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/helpers';

/**
 * FixtureList — groups matches by round or date and renders them.
 *
 * Props:
 *   matches      — array of match objects
 *   tournamentId — for building links
 *   isOwner      — show edit/delete per card
 *   onDelete     — callback(match)
 *   groupBy      — 'round' | 'date' | 'none'
 *   view         — 'card' | 'row'
 *   emptyTitle   — custom empty state title
 *   emptyMessage — custom empty state message
 */
export default function FixtureList({
  matches      = [],
  tournamentId,
  isOwner      = false,
  onDelete,
  groupBy      = 'round',
  view         = 'row',
  emptyTitle   = 'No fixtures',
  emptyMessage = 'No matches scheduled.',
}) {
  if (!matches.length) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        compact
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        }
      />
    );
  }

  if (groupBy === 'none') {
    return (
      <div className={view === 'card'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        : 'flex flex-col gap-3'
      }>
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            tournamentId={tournamentId}
            isOwner={isOwner}
            onDelete={onDelete}
            view={view}
          />
        ))}
      </div>
    );
  }

  // Group matches
  const groups = groupMatches(matches, groupBy);

  return (
    <div className="space-y-8">
      {groups.map(({ label, items }) => (
        <section key={label}>
          {/* Group header */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-display font-bold text-slate-800 text-base">{label}</h3>
            <span className="text-xs text-slate-400 font-medium">
              {items.length} {items.length === 1 ? 'match' : 'matches'}
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Matches */}
          <div className={view === 'card'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3'
          }>
            {items.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                tournamentId={tournamentId}
                isOwner={isOwner}
                onDelete={onDelete}
                view={view}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Grouping helpers ──────────────────────────────────────────────────────────

function groupMatches(matches, by) {
  if (by === 'date') {
    const map = new Map();
    for (const m of matches) {
      const key = m.match_date?.slice(0, 10) ?? 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return [...map.entries()].map(([key, items]) => ({
      label: formatDate(key),
      items,
    }));
  }

  // group by round (default)
  const withRound    = matches.filter((m) => m.round_name);
  const withoutRound = matches.filter((m) => !m.round_name);

  const map = new Map();
  for (const m of withRound) {
    if (!map.has(m.round_name)) map.set(m.round_name, []);
    map.get(m.round_name).push(m);
  }

  const result = [...map.entries()].map(([label, items]) => ({ label, items }));
  if (withoutRound.length) result.push({ label: 'Other Matches', items: withoutRound });
  return result;
}