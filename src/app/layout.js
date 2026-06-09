// src/app/layout.js

import "./globals.css";
import { Barlow_Condensed, DM_Sans } from "next/font/google";

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata = {
  title: {
    default: "TournaLive — Tournament Management Platform",
    template: "%s | TournaLive",
  },
  description:
    "Create and manage football tournaments. Track live scores, goals, cards, and standings in real time.",
  keywords: [
    "tournament",
    "football",
    "live scores",
    "sports management",
    "league",
  ],
  authors: [{ name: "Nepo Games" }],
  openGraph: {
    type: "website",
    siteName: "TournaLive",
    title: "TournaLive — Tournament Management Platform",
    description:
      "Manage tournaments, track live scores, and run leagues effortlessly.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${barlow.variable} ${dmSans.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>

      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}