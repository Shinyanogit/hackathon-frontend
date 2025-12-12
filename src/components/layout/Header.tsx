"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";

type NavIcon = "compass" | "dress" | "jacket" | "toy";

type Props = {
  onSearch?: (query: string) => void;
  locale: "ja" | "en";
  onLocaleChange: (locale: "ja" | "en") => void;
  brandName: string;
  brandTagline: string;
  navLinks: { href: string; label: string; icon: NavIcon }[];
  signupLabel: string;
  searchPlaceholder: string;
};

const navIconMap: Record<NavIcon, ReactElement> = {
  compass: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-slate-700 transition group-hover:text-emerald-700"
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14.8 9.2 11 11l-1.8 3.8 3.8-1.8 1.8-3.8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dress: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-slate-700 transition group-hover:text-emerald-700"
    >
      <circle cx="12" cy="5.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.8 9.2 9 8 12.5l3 6.5h2l3-6.5L14.8 9 12 7.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 10.6c1.8.9 3.8.9 5.6 0" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  jacket: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-slate-700 transition group-hover:text-emerald-700"
    >
      <circle cx="12" cy="5.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 8.5h4c.8 0 1.5.7 1.5 1.5v4c0 1-.8 1.8-1.8 1.8h-3.4C9 15.8 8.2 15 8.2 14v-4c0-.8.7-1.5 1.5-1.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 9.8H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 9.8h-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 15.8v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 15.8v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  toy: (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 text-slate-700 transition group-hover:text-emerald-700"
    >
      <circle cx="12" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.2" cy="8.5" r=".8" fill="currentColor" />
      <circle cx="14.8" cy="8.5" r=".8" fill="currentColor" />
      <circle cx="12" cy="11.6" r="1.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 12.4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 13.6c1.8 1 4.2 1 6 0" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9.2" cy="6.4" r="1.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14.8" cy="6.4" r="1.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 14.5c0 3 2.5 5.5 5 5.5s5-2.5 5-5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export function Header({
  onSearch,
  locale,
  onLocaleChange,
  brandName,
  brandTagline,
  navLinks,
  signupLabel,
  searchPlaceholder,
}: Props) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-md">
            FM
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold text-slate-900">{brandName}</p>
            <p className="text-xs text-slate-500">{brandTagline}</p>
          </div>
        </Link>
        <div className="hidden flex-1 lg:block">
          <SearchBar compact onSubmit={onSearch} placeholder={searchPlaceholder} />
        </div>
        <nav className="hidden items-center gap-3 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={link.label}
            >
              <span className="flex">{navIconMap[link.icon]}</span>
              <span className="sr-only">{link.label}</span>
              <span className="pointer-events-none absolute top-[120%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-sm transition duration-150 group-hover:top-[130%] group-hover:opacity-100 group-focus-visible:top-[130%] group-focus-visible:opacity-100">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {!user && (
            <Link
              href="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 whitespace-nowrap"
            >
              {signupLabel}
            </Link>
          )}
          <AuthButton />
          <LanguageToggle value={locale} onChange={onLocaleChange} />
        </div>
      </div>
      <div className="border-t border-slate-100 bg-white lg:hidden">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <SearchBar compact onSubmit={onSearch} placeholder={searchPlaceholder} />
        </div>
      </div>
    </header>
  );
}
