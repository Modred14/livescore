// src/components/ui/Card.js

'use client';

/**
 * Card component family.
 *
 * <Card>                   — base white card with shadow + border
 * <Card.Header>            — top section with optional divider
 * <Card.Body>              — padded content area
 * <Card.Footer>            — bottom section with top border
 * <StatCard>               — metric/KPI card (icon + label + value + trend)
 * <EmptyCard>              — empty-state placeholder
 */

/* ── Base Card ─────────────────────────────────────────────────────────────── */
function Card({
  children,
  className    = '',
  padding      = true,   // if false, no default padding (let sub-components handle it)
  hover        = false,  // adds hover lift effect
  border       = true,
  shadow       = true,
  as: Tag      = 'div',
  onClick,
  ...rest
}) {
  const classes = [
    'bg-white rounded-xl',
    border ? 'border border-slate-200' : '',
    shadow ? 'shadow-sm' : '',
    padding ? 'p-5' : '',
    hover
      ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
      : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} onClick={onClick} {...rest}>
      {children}
    </Tag>
  );
}

/* ── Card.Header ───────────────────────────────────────────────────────────── */
function CardHeader({ children, className = '', divider = true }) {
  return (
    <div
      className={[
        'px-5 pt-5 pb-4',
        divider ? 'border-b border-slate-100' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

/* ── Card.Body ─────────────────────────────────────────────────────────────── */
function CardBody({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
}

/* ── Card.Footer ───────────────────────────────────────────────────────────── */
function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-5 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-xl ${className}`}
    >
      {children}
    </div>
  );
}

// Attach sub-components
Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;

export default Card;

/* ── StatCard ──────────────────────────────────────────────────────────────── */
/**
 * @param {string}  label       — metric label e.g. "Total Matches"
 * @param {string|number} value — main number / text
 * @param {string}  [icon]      — React node (SVG icon)
 * @param {string}  [iconColor] — Tailwind bg class for icon bg, e.g. "bg-blue-100"
 * @param {string}  [iconText]  — Tailwind text class for icon colour
 * @param {string}  [trend]     — e.g. "+12%"
 * @param {'up'|'down'|'neutral'} [trendDir]
 * @param {string}  [caption]   — small sub-text below value
 */
export function StatCard({
  label,
  value,
  icon,
  iconColor = 'bg-blue-50',
  iconText  = 'text-blue-600',
  trend,
  trendDir  = 'neutral',
  caption,
  className = '',
}) {
  const trendColors = {
    up:      'text-green-600 bg-green-50',
    down:    'text-red-600   bg-red-50',
    neutral: 'text-slate-500 bg-slate-100',
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold font-display text-slate-900 leading-none">
            {value ?? '—'}
          </p>
          {caption && (
            <p className="mt-1 text-xs text-slate-500">{caption}</p>
          )}
          {trend && (
            <span
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColors[trendDir]}`}
            >
              {trendDir === 'up' && '↑'}
              {trendDir === 'down' && '↓'}
              {trend}
            </span>
          )}
        </div>

        {icon && (
          <div
            className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-xl ${iconColor}`}
          >
            <span className={`h-5 w-5 ${iconText}`}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EmptyCard ─────────────────────────────────────────────────────────────── */
/**
 * Generic empty-state block displayed inside a card or section.
 */
export function EmptyCard({
  title     = 'Nothing here yet',
  message   = '',
  icon,
  action,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {icon ? (
        <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 text-slate-400">
          <span className="h-7 w-7">{icon}</span>
        </div>
      ) : (
        <div className="mb-4 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      {message && <p className="text-xs text-slate-400 max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}