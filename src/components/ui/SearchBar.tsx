"use client";

import { FormEvent, useState } from "react";

type Props = {
  placeholder?: string;
  onSubmit?: (query: string) => void;
  compact?: boolean;
  filterLabel?: string;
  filterOptions?: { label: string; value: string }[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
};

export function SearchBar({
  placeholder,
  onSubmit,
  compact = false,
  filterLabel = "絞り込み",
  filterOptions,
  selectedFilter,
  onFilterChange,
}: Props) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const selectedLabel =
    selectedFilter && filterOptions?.find((opt) => opt.value === selectedFilter)?.label;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(value.trim());
  };

  const handleFilterClick = () => {
    if (!filterOptions || filterOptions.length === 0) return;
    setOpen((prev) => !prev);
  };

  const handleSelectOption = (val: string) => {
    onFilterChange?.(val);
    setOpen(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center rounded-full border border-slate-200 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-emerald-500/70 ${
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
      <button
        type="button"
        onClick={handleFilterClick}
        className="relative ml-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
      >
        {selectedLabel ? `${filterLabel}: ${selectedLabel}` : filterLabel}
      </button>
      {open && filterOptions && filterOptions.length > 0 && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <ul className="max-h-64 overflow-y-auto text-sm text-slate-700">
            <li>
              <button
                type="button"
                className={`flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-emerald-50 ${
                  selectedFilter === "" ? "bg-emerald-50 text-emerald-700" : ""
                }`}
                onClick={() => handleSelectOption("")}
              >
                すべて
              </button>
            </li>
            {filterOptions.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-emerald-50 ${
                    selectedFilter === opt.value ? "bg-emerald-50 text-emerald-700" : ""
                  }`}
                  onClick={() => handleSelectOption(opt.value)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
