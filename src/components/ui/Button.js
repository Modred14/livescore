// src/components/ui/Button.js

'use client';

import Spinner from './Spinner';

/**
 * Button variants:
 *   primary   — solid blue (default)
 *   secondary — outline blue
 *   ghost     — transparent / text only
 *   danger    — solid red
 *   success   — solid green
 *
 * Sizes:  xs | sm | md | lg | xl
 */

const VARIANT_CLASSES = {
  primary:
    'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 hover:border-blue-700 active:bg-blue-800 focus-visible:ring-blue-500 shadow-sm',
  secondary:
    'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 active:bg-blue-100 focus-visible:ring-blue-500',
  ghost:
    'bg-transparent text-blue-600 border border-transparent hover:bg-blue-50 hover:border-blue-100 active:bg-blue-100 focus-visible:ring-blue-500',
  danger:
    'bg-red-600 text-white border border-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-sm',
  success:
    'bg-green-600 text-white border border-green-600 hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-500 shadow-sm',
  neutral:
    'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-400',
};

const SIZE_CLASSES = {
  xs:  'text-xs  px-2.5 py-1   gap-1   rounded-md',
  sm:  'text-sm  px-3.5 py-1.5 gap-1.5 rounded-lg',
  md:  'text-sm  px-4   py-2   gap-2   rounded-lg',
  lg:  'text-base px-5  py-2.5 gap-2   rounded-xl',
  xl:  'text-base px-7  py-3   gap-2.5 rounded-xl',
};

const ICON_SIZE = {
  xs:  'h-3 w-3',
  sm:  'h-4 w-4',
  md:  'h-4 w-4',
  lg:  'h-5 w-5',
  xl:  'h-5 w-5',
};

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  type      = 'button',
  href,
  disabled  = false,
  loading   = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const baseClasses = [
    'inline-flex items-center justify-center font-medium',
    'transition-all duration-150 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'select-none whitespace-nowrap',
    VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
    SIZE_CLASSES[size]       ?? SIZE_CLASSES.md,
    fullWidth  ? 'w-full'   : '',
    isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Spinner
          size={size === 'xs' || size === 'sm' ? 'sm' : 'md'}
          className="text-current"
        />
      ) : (
        leftIcon && (
          <span className={`shrink-0 ${ICON_SIZE[size]}`} aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      {children && <span>{children}</span>}
      {!loading && rightIcon && (
        <span className={`shrink-0 ${ICON_SIZE[size]}`} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </>
  );

  if (href && !isDisabled) {
    // Use a plain <a> tag; Next.js Link is used at the page level
    return (
      <a href={href} className={baseClasses} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={baseClasses}
      aria-busy={loading}
      {...rest}
    >
      {content}
    </button>
  );
}