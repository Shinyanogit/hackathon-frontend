"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchBar } from "@/components/ui/SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import { BellIcon } from "@/components/ui/icons/BellIcon";
import { fetchNotifications, markAllNotificationsRead } from "@/lib/api/notifications";
import type { Notification } from "@/types/notification";

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
  hideSearch?: boolean;
};

export function Header({
  onSearch,
  locale: _locale, // unused
  onLocaleChange: _onLocaleChange, // unused
  brandName,
  brandTagline,
  signupLabel,
  searchPlaceholder,
  filterOptions,
  selectedFilter,
  onFilterChange,
  hideSearch = false,
}: Props) {
  void _locale;
  void _onLocaleChange;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["me", "notifications", "header"],
    queryFn: () => fetchNotifications({ unreadOnly: false, limit: 20 }),
    enabled: !!user,
    refetchInterval: 60000,
  });
  const unreadCount = notificationsData?.unreadCount ?? 0;

  useEffect(() => {
    if (!user) {
      setNotifOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (!notifOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [notifOpen]);

  const openNotifications = async () => {
    if (notifOpen) {
      setNotifOpen(false);
      return;
    }
    await markAllNotificationsRead().catch(() => {});
    await queryClient.invalidateQueries({ queryKey: ["me", "notifications", "header"] });
    setNotifOpen(true);
  };

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
        {!hideSearch && (
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
        )}
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <div className="relative">
              <button
                onClick={openNotifications}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <BellIcon className="h-5 w-5 text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  ref={notifRef}
                  className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">通知</p>
                    <button
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                      onClick={() => setNotifOpen(false)}
                    >
                      閉じる
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto px-4 py-3 text-sm text-slate-800">
                    {notificationsData?.notifications.length === 0 && (
                      <p className="text-xs text-slate-500">通知はありません。</p>
                    )}
                    {notificationsData?.notifications.map((n: Notification) => (
                      <Link
                        key={n.id}
                        href={
                          n.conversationId
                            ? `/items/${n.itemId ?? ""}?conversationId=${n.conversationId}`
                            : n.itemId
                              ? `/items/${n.itemId}`
                              : "#"
                        }
                        className="block rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-sm hover:border-emerald-200"
                        onClick={async () => {
                          setNotifOpen(false);
                          await refetchNotifications();
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            <BellIcon className="h-4 w-4 text-emerald-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">{n.title || "通知"}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-3 whitespace-pre-line">
                              {n.body}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="mt-1 inline-flex h-5 items-center rounded-full bg-emerald-600 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
                              NEW
                            </span>
                          )}
                        </div>
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
      {!hideSearch && (
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
      )}
    </header>
  );
}
