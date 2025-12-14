"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchBar } from "@/components/ui/SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import { BellIcon } from "@/components/ui/icons/BellIcon";
import { listConversations, markConversationRead } from "@/lib/api/conversations";

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.uid],
    queryFn: listConversations,
    enabled: !!user,
  });
  const displayConversations =
    conversations?.filter((cv) => !dismissed.has(cv.conversationId)) ?? [];
  const count = displayConversations.length;

  useEffect(() => {
    if (!user) {
      setNotifOpen(false);
      setDismissed(new Set());
    }
  }, [user]);

  useEffect(() => {
    if (conversations) {
      setDismissed(new Set()); // reset when refetched
    }
  }, [conversations]);

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
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen((p) => !p)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <BellIcon className="h-5 w-5 text-slate-700" />
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">DM通知</p>
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      onClick={() => setNotifOpen(false)}
                    >
                      閉じる
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-4 py-3 text-sm text-slate-800">
                    {count === 0 && <p className="text-xs text-slate-500">通知はありません。</p>}
                    {displayConversations.map((cv) => (
                      <Link
                        key={cv.conversationId}
                        href={`/items/${cv.itemId}?conversationId=${cv.conversationId}`}
                        className="block rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm hover:border-emerald-200"
                        onClick={async () => {
                          setNotifOpen(false);
                          await markConversationRead(cv.conversationId).catch(() => {});
                          setDismissed((prev) => {
                            const next = new Set(prev);
                            next.add(cv.conversationId);
                            return next;
                          });
                        }}
                      >
                        <p className="text-xs font-semibold text-slate-700">会話ID: {cv.conversationId}</p>
                        <p className="text-xs text-slate-500">商品ID: {cv.itemId}</p>
                        <p className="text-xs text-slate-500">相手: {cv.sellerUid === user?.uid ? cv.buyerUid : cv.sellerUid}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!user && (
            <Link
              href="/signup"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 whitespace-nowrap"
            >
              {signupLabel}
            </Link>
          )}
          <AuthButton />
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
