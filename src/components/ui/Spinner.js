// src/components/ui/Spinner.js

'use client';

/**
 * Spinner sizes:
 *   xs | sm | md | lg | xl
 *
 * Usage:
 *   <Spinner />
 *   <Spinner size="lg" className="text-blue-600" />
 */

const SIZE_CLASSES = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-2',
  xl: 'h-10 w-10 border-[3px]',
};

export default function Spinner({ size = 'md', className = '', label = 'Loading…' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span
        className={[
          'animate-spin rounded-full',
          'border-current border-t-transparent',
          SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
          'opacity-80',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Full-page loading overlay — used during route transitions or data fetching.
 */
export function PageSpinner({ message = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Spinner size="xl" className="text-blue-600" />
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-500">{message}</p>
      )}
    </div>
  );
}

/**
 * Inline section spinner — centred inside a container.
 */
export function SectionSpinner({ message = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Spinner size="lg" className="text-blue-500" />
      {message && (
        <p className="text-sm text-slate-400">{message}</p>
      )}
    </div>
  );
}