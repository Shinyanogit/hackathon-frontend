"use client";

import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

type Props = {
  onSearch?: (query: string) => void;
  locale: "ja" | "en";
  onLocaleChange: (locale: "ja" | "en") => void;
  brandName: string;
  brandTagline: string;
  navLinks: { href: string; label: string }[];
  loginLabel: string;
  signupLabel: string;
  searchPlaceholder: string;
};

export function Header({
  onSearch,
  locale,
  onLocaleChange,
  brandName,
  brandTagline,
  navLinks,
  loginLabel,
  signupLabel,
  searchPlaceholder,
}: Props) {
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
        <nav className="hidden items-center gap-4 text-sm font-semibold text-slate-700 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-700">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:text-emerald-700 sm:inline-flex"
          >
            {loginLabel}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            {signupLabel}
          </Link>
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
