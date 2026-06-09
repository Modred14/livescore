// src/app/page.js

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "TournaLive — Run Your Tournament Like a Pro",
  description:
    "Create and manage football tournaments with live scoring, standings, and real-time updates.",
};

/* ── Feature data ────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path
          fillRule="evenodd"
          d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 000 4.5h9a2.25 2.25 0 000-4.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.798 49.798 0 00-6.093-.377.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.343v.256zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 01-2.863 3.207 6.72 6.72 0 00.857-3.294z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600",
    heading: "Tournament Builder",
    body: "Create league, knockout, or group-stage tournaments in minutes with full customisation.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
        <path
          fillRule="evenodd"
          d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "bg-green-50 text-green-600",
    heading: "Team & Player Management",
    body: "Register teams, manage rosters, assign players and track individual stats.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "bg-red-50 text-red-600",
    heading: "Live Scoring",
    body: "Record goals, cards, and substitutions in real time. Scores update instantly.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
      </svg>
    ),
    color: "bg-purple-50 text-purple-600",
    heading: "Auto Standings",
    body: "Standings tables update automatically after every match result.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path
          fillRule="evenodd"
          d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: "bg-orange-50 text-orange-600",
    heading: "Bracket View",
    body: "Knockout bracket visualisation — see the full path to the championship.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
      >
        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
      </svg>
    ),
    color: "bg-teal-50 text-teal-600",
    heading: "Multi-Tenant",
    body: "Each organiser gets their own isolated workspace. Run multiple leagues in parallel.",
  },
];

const STATS = [
  { label: "Tournaments created", value: "2,400+" },
  { label: "Teams registered", value: "18,000+" },
  { label: "Live matches tracked", value: "95,000+" },
  { label: "Goals recorded", value: "430,000+" },
];

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-slate-900 text-white">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-blue-800/20 blur-3xl" />
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 60px)",
              }}
            />
          </div>

          <div className="container-app relative z-10 py-24 md:py-36">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Live scoring · Real-time updates
              </div>

              <h1 className="font-display text-white text-5xl md:text-7xl font-extrabold leading-none tracking-tight mb-6">
                Run Your <span className="text-blue-400">Tournament</span>
                <br />
                Like a Pro
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
                Create leagues, manage teams, schedule matches, and broadcast
                live scores — all from one powerful platform built for football
                organisers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  href={ROUTES.REGISTER}
                  size="lg"
                  className="shadow-brand-lg"
                >
                  Start for free
                </Button>
                <Button
                  href={ROUTES.TOURNAMENTS}
                  variant="ghost"
                  size="lg"
                  className="text-slate-300 border focus:!bg-slate-800 !border-slate-300/20 hover:bg-white/10 bg-white/5 hover:border-slate-600"
                >
                  View tournaments
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
        </section>

        {/* ── Stats strip ── */}
        <section className="bg-white border-y border-slate-200">
          <div className="container-app py-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center px-6 py-2">
                  <p className="font-display text-3xl md:text-4xl font-extrabold text-blue-600">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section bg-slate-50">
          <div className="container-app">
            <div className="text-center mb-14">
              <Badge variant="blue" size="md" className="mb-4">
                Everything you need
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                Built for tournament organisers
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Every feature you need to run a professional football
                tournament, from sign-ups to the final whistle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <Card key={feat.heading} hover className="group">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feat.color}`}
                  >
                    {feat.icon}
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                    {feat.heading}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feat.body}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live score preview ── */}
        <section className="section bg-white">
          <div className="container-app">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="red" dot pulse size="md" className="mb-4">
                  Live right now
                </Badge>
                <h2 className="font-display text-4xl md:text-5xl font-extrabold text-slate-900 mb-5">
                  Real-time scores,
                  <br />
                  zero delay
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                  Update goals, cards, and substitutions from any device. Your
                  audience sees every moment as it happens — no page refresh
                  needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button href={ROUTES.REGISTER} size="md">
                    Get started free
                  </Button>
                  <Button href={ROUTES.LOGIN} variant="secondary" size="md">
                    Sign in
                  </Button>
                </div>
              </div>

              {/* Mock scoreboard card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600/5 rounded-3xl blur-xl" />
                <Card className="relative border-slate-200 shadow-lg overflow-hidden">
                  {/* Match header */}
                  <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-100 uppercase tracking-widest">
                      Liga Premier · Matchday 12
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                      LIVE 74'
                    </span>
                  </div>

                  {/* Score */}
                  <div className="px-5 py-8 flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 text-2xl">
                        🦅
                      </div>
                      <p className="font-display font-bold text-slate-900 text-sm">
                        Eagles FC
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="font-display font-extrabold text-5xl text-slate-900 leading-none">
                        2 <span className="text-slate-300">—</span> 1
                      </p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3 text-2xl">
                        🦁
                      </div>
                      <p className="font-display font-bold text-slate-900 text-sm">
                        Lions United
                      </p>
                    </div>
                  </div>

                  {/* Events */}
                  <div className="border-t border-slate-100 px-5 py-3 space-y-2.5">
                    {[
                      {
                        min: "12'",
                        icon: "⚽",
                        team: "home",
                        text: "Adaeze O.",
                      },
                      { min: "38'", icon: "⚽", team: "away", text: "Kalu N." },
                      {
                        min: "61'",
                        icon: "⚽",
                        team: "home",
                        text: "Emeka C.",
                      },
                      { min: "67'", icon: "🟨", team: "away", text: "Bode A." },
                    ].map((ev, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 text-xs ${ev.team === "home" ? "flex-row" : "flex-row-reverse"}`}
                      >
                        <span className="font-mono text-slate-400 w-8 shrink-0">
                          {ev.min}
                        </span>
                        <span>{ev.icon}</span>
                        <span className="font-medium text-slate-700">
                          {ev.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="section bg-blue-600">
          <div className="container-app text-center">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-5">
              Ready to run your tournament?
            </h2>
            <p className="text-blue-100 text-lg max-w-lg mx-auto mb-10">
              Join thousands of organisers already using TournaLive. It's free
              to get started.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href={ROUTES.REGISTER}
                size="lg"
                className="bg-white hover:!bg-white/90 !text-blue-700 border-white shadow-lg"
              >
                Create your tournament
              </Button>
              <Button
                href={ROUTES.LOGIN}
                variant="ghost"
                size="lg"
                className="!text-white !border-white/30 hover:!bg-white/10"
              >
                Sign in
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
