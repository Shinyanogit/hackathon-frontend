"use client";

import Link from "next/link";

type Props = {
  badge: string;
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
  chips: string[];
};

export function HeroSection({
  badge,
  title,
  description,
  primaryCta,
  secondaryCta,
  chips,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-10 lg:flex lg:items-center lg:gap-10">
      <div className="relative z-10 max-w-xl space-y-6">
        <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
          {badge}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="text-base text-slate-600 sm:text-lg">
          {description}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/sell"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-700"
          >
            {primaryCta}
          </Link>
          <Link
            href="/items"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:text-emerald-700"
          >
            {secondaryCta}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-white/80 px-3 py-1">
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="relative mt-10 flex-1 lg:mt-0">
        <div className="absolute inset-0 -left-6 -right-6 -top-6 rounded-[40px] bg-gradient-to-tr from-emerald-200/50 via-transparent to-sky-200/40 blur-3xl" />
        <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
            alt="Fashion collage"
            className="h-full w-full object-cover"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
            curated picks
          </div>
          <div className="absolute bottom-4 right-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow">
            Free to list. Sell fast.
          </div>
        </div>
      </div>
    </section>
  );
}
