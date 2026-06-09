// src/components/ui/EmptyState.js

'use client';

/**
 * EmptyState — zero-content placeholder for lists and pages.
 *
 * Usage:
 *   <EmptyState
 *     icon={<TrophyIcon />}
 *     title="No tournaments yet"
 *     message="Create your first tournament to get started."
 *     action={<Button href="/tournaments/create">Create Tournament</Button>}
 *   />
 */

export default function EmptyState({
  icon,
  title    = 'Nothing here yet',
  message  = '',
  action,
  compact  = false,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-10 px-4' : 'py-20 px-6',
        className,
      ].join(' ')}
    >
      {/* Icon */}
      <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400">
        {icon ?? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        )}
      </div>

      <h3 className="font-display text-base font-bold text-slate-700 mb-2">{title}</h3>

      {message && (
        <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{message}</p>
      )}

      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}