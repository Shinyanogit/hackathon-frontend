"use client";

import { FormEvent, useState } from "react";

type Props = {
  placeholder?: string;
  onSubmit?: (query: string) => void;
  compact?: boolean;
};

export function SearchBar({ placeholder, onSubmit, compact = false }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-emerald-500/70 ${
        compact ? "px-3 py-2" : "px-4 py-2.5"
      }`}
    >
      <svg
        className="h-5 w-5 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.65" y1="16.65" x2="21" y2="21" />
      </svg>
      <input
        className="ml-3 flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        placeholder={placeholder ?? "Search preloved finds"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className="ml-3 hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:inline-flex"
      >
        Search
      </button>
    </form>
  );
}
