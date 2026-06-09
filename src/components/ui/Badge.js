// src/components/ui/Badge.js

'use client';

import { statusBgColor } from '@/lib/helpers';

/**
 * Badge component.
 *
 * Variants (manual):
 *   blue | green | red | yellow | orange | purple | slate | white
 *
 * Or pass `status` prop to automatically derive colour from match/tournament status
 *   e.g. <Badge status="live" /> → red
 *
 * Sizes: xs | sm | md
 *
 * Usage:
 *   <Badge variant="green">Active</Badge>
 *   <Badge status="live">Live</Badge>
 *   <Badge dot variant="red">Danger</Badge>
 */

const VARIANT_CLASSES = {
  blue:   'bg-blue-50   text-blue-700   border-blue-200',
  green:  'bg-green-50  text-green-700  border-green-200',
  red:    'bg-red-50    text-red-700    border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  slate:  'bg-slate-50  text-slate-600  border-slate-200',
  white:  'bg-white     text-slate-700  border-slate-200',
  dark:   'bg-slate-800 text-white      border-slate-700',
};

const DOT_COLORS = {
  blue:   'bg-blue-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  slate:  'bg-slate-400',
  white:  'bg-slate-400',
  dark:   'bg-slate-300',
};

const SIZE_CLASSES = {
  xs: 'text-[10px] px-1.5 py-0.5 gap-1 rounded',
  sm: 'text-xs     px-2   py-0.5 gap-1.5 rounded-md',
  md: 'text-xs     px-2.5 py-1   gap-1.5 rounded-md',
};

export default function Badge({
  children,
  variant  = 'slate',
  status,           // auto-derive colour from status string
  size     = 'sm',
  dot      = false, // show a coloured dot prefix
  pulse    = false, // animate dot (for "live")
  className = '',
}) {
  // If `status` is provided, use statusBgColor helper to get classes
  const colorClasses = status
    ? statusBgColor(status)
    : (VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.slate);

  // For the dot colour, try to infer from status or fall back to variant
  const dotColor = status
    ? getDotColorFromStatus(status)
    : (DOT_COLORS[variant] ?? DOT_COLORS.slate);

  const classes = [
    'inline-flex items-center border font-medium whitespace-nowrap',
    colorClasses,
    SIZE_CLASSES[size] ?? SIZE_CLASSES.sm,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {dot && (
        <span
          className={[
            'shrink-0 rounded-full',
            size === 'xs' ? 'h-1.5 w-1.5' : 'h-2 w-2',
            dotColor,
            pulse ? 'animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

function getDotColorFromStatus(status) {
  const map = {
    live:      'bg-red-500',
    active:    'bg-green-500',
    upcoming:  'bg-blue-400',
    scheduled: 'bg-blue-400',
    completed: 'bg-slate-400',
    draft:     'bg-slate-300',
    postponed: 'bg-yellow-400',
    cancelled: 'bg-red-300',
    half_time: 'bg-orange-400',
  };
  return map[status] ?? 'bg-slate-400';
}

/* ── Convenience exports ────────────────────────────────────────────────── */

/** Live badge with pulsing red dot */
export function LiveBadge({ className = '' }) {
  return (
    <Badge status="live" dot pulse size="sm" className={className}>
      LIVE
    </Badge>
  );
}

/** Tournament status badge */
export function TournamentStatusBadge({ status, className = '' }) {
  const labels = {
    draft:     'Draft',
    upcoming:  'Upcoming',
    active:    'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return (
    <Badge status={status} dot size="sm" className={className}>
      {labels[status] ?? status}
    </Badge>
  );
}

/** Match status badge */
export function MatchStatusBadge({ status, minute, className = '' }) {
  const labels = {
    scheduled:  'Scheduled',
    live:       minute ? `${minute}'` : 'Live',
    half_time:  'HT',
    completed:  'FT',
    postponed:  'Postponed',
    cancelled:  'Cancelled',
  };
  return (
    <Badge
      status={status}
      dot={status === 'live'}
      pulse={status === 'live'}
      size="sm"
      className={className}
    >
      {labels[status] ?? status}
    </Badge>
  );
}