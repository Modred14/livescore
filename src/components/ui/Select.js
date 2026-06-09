// src/components/ui/Select.js

'use client';

/**
 * Select — styled native <select> wrapper.
 *
 * Props:
 *   label     — visible label
 *   hint      — helper text below
 *   error     — validation error (turns border red)
 *   options   — array of { value, label } objects
 *   size      — 'sm' | 'md' | 'lg'
 *   fullWidth — default true
 *   placeholder — empty first option text (e.g. "Select a type…")
 */

const SIZE_CLASSES = {
  sm: 'text-sm  px-3   py-1.5 rounded-lg',
  md: 'text-sm  px-3.5 py-2.5 rounded-lg',
  lg: 'text-base px-4  py-3   rounded-xl',
};

export default function Select({
  id,
  label,
  hint,
  error,
  options      = [],
  size         = 'md',
  fullWidth    = true,
  placeholder,
  className    = '',
  disabled     = false,
  required     = false,
  value,
  onChange,
  ...rest
}) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const baseClasses = [
    'block border font-body transition-colors duration-150 appearance-none',
    'bg-white text-slate-900',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500',
    error
      ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
      : 'border-slate-300 hover:border-slate-400',
    disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer',
    SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
    fullWidth ? 'w-full' : '',
    'pr-10', // space for the arrow icon
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={baseClasses}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron icon */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </div>

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