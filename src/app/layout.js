// src/app/layout.js

import './globals.css';

export const metadata = {
  title: {
    default: 'TournaLive — Tournament Management Platform',
    template: '%s | TournaLive',
  },
  description:
    'Create and manage football tournaments. Track live scores, goals, cards, and standings in real time.',
  keywords: ['tournament', 'football', 'live scores', 'sports management', 'league'],
  authors: [{ name: 'Nepo Games' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
  openGraph: {
    type:        'website',
    siteName:    'TournaLive',
    title:       'TournaLive — Tournament Management Platform',
    description: 'Manage tournaments, track live scores, and run leagues effortlessly.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts (also loaded via CSS @import) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}