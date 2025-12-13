"use client";

import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";

type Props = {
  onSearch?: (query: string) => void;
  locale: "ja" | "en";
  onLocaleChange: (locale: "ja" | "en") => void;
  brandName: string;
  brandTagline: string;
  signupLabel: string;
  searchPlaceholder: string;
  filterOptions?: { label: string; value: string }[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
};

export function Header({
  onSearch,
  locale,
  onLocaleChange,
  brandName,
  brandTagline,
  signupLabel,
  searchPlaceholder,
  filterOptions,
  selectedFilter,
  onFilterChange,
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
          <SearchBar
            compact
            onSubmit={onSearch}
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={onFilterChange}
            placeholder={searchPlaceholder}
          />
        </div>
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
          <SearchBar
            compact
            onSubmit={onSearch}
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={onFilterChange}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
    </header>
  );
}
