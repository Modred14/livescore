// src/components/ui/Input.js

'use client';

/**
 * Input component — supports text, email, password, number, search, textarea.
 *
 * Props:
 *   label       — visible label text
 *   hint        — helper text below the field
 *   error       — error message (turns border red)
 *   leftIcon    — React node rendered inside left side
 *   rightIcon   — React node rendered inside right side
 *   fullWidth   — stretches to 100% (default true)
 *   multiline   — renders a <textarea> instead of <input>
 *   rows        — textarea row count (default 4)
 *   size        — 'sm' | 'md' | 'lg'
 */

const SIZE_CLASSES = {
  sm: 'text-sm  px-3 py-1.5 rounded-lg',
  md: 'text-sm  px-3.5 py-2.5 rounded-lg',
  lg: 'text-base px-4 py-3 rounded-xl',
};

const ICON_PAD_LEFT  = { sm: 'pl-8',  md: 'pl-9',  lg: 'pl-10' };
const ICON_PAD_RIGHT = { sm: 'pr-8',  md: 'pr-9',  lg: 'pr-10' };

export default function Input({
  id,
  label,
  hint,
  error,
  type        = 'text',
  size        = 'md',
  leftIcon,
  rightIcon,
  fullWidth   = true,
  multiline   = false,
  rows        = 4,
  className   = '',
  disabled    = false,
  required    = false,
  ...rest
}) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseInput = [
    'block border font-body transition-colors duration-150',
    'bg-white text-slate-900 placeholder:text-slate-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500',
    error
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-slate-300 hover:border-slate-400',
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : '',
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    leftIcon  ? ICON_PAD_LEFT[size]  : '',
    rightIcon ? ICON_PAD_RIGHT[size] : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconBaseLeft  = 'absolute left-3  top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center';
  const iconBaseRight = 'absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {leftIcon && (
          <span className={iconBaseLeft} aria-hidden="true">
            <span className="h-4 w-4">{leftIcon}</span>
          </span>
        )}

        {multiline ? (
          <textarea
            id={inputId}
            rows={rows}
            disabled={disabled}
            required={required}
            className={[baseInput, '!py-2.5 resize-y min-h-[80px]'].join(' ')}
            {...rest}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            className={baseInput}
            {...rest}
          />
        )}

        {rightIcon && (
          <span className={iconBaseRight} aria-hidden="true">
            <span className="h-4 w-4">{rightIcon}</span>
          </span>
        )}
      </div>

      {/* Hint / Error */}
      {(error || hint) && (
        <p
          className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-slate-500'}`}
          role={error ? 'alert' : undefined}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

/* ── Convenience wrappers ───────────────────────────────────────────────── */

export function PasswordInput({ showToggle = true, ...props }) {
  const [visible, setVisible] = require('react').useState(false);

  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      {visible ? (
        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
      ) : (
        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      )}
      {!visible && (
        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      )}
    </svg>
  );

  return (
    <Input
      type={visible ? 'text' : 'password'}
      rightIcon={
        showToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer pointer-events-auto"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            <EyeIcon />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
}

export function SearchInput({ onClear, ...props }) {
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
  );

  return (
    <Input
      type="search"
      leftIcon={<SearchIcon />}
      {...props}
    />
  );
}