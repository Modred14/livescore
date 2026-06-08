// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
      },
      backgroundImage: {
        'hero-pattern':
          'radial-gradient(ellipse 80% 60% at 50% -10%, #1d4ed8 0%, transparent 70%)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)',
      },
      boxShadow: {
        'brand-sm': '0 1px 3px rgba(37,99,235,0.15)',
        'brand':    '0 4px 14px rgba(37,99,235,0.25)',
        'brand-lg': '0 8px 30px rgba(37,99,235,0.35)',
        'glass':    '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};