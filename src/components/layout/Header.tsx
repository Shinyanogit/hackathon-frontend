"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { SearchBar } from "@/components/ui/SearchBar";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import { BellIcon } from "@/components/ui/icons/BellIcon";
import { listConversations, listMessages, markConversationRead } from "@/lib/api/conversations";
import { fetchItem } from "@/lib/api/items";
import { fetchPublicUser } from "@/lib/api/users";

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
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());
  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.uid],
    queryFn: listConversations,
    enabled: !!user,
  });
  const displayConversations =
    conversations?.filter((cv) => !dismissed.has(cv.conversationId)) ?? [];
  const unreadCount =
    conversations?.filter((cv) => cv.hasUnread === true && !dismissed.has(cv.conversationId))
      .length ?? 0;

  useEffect(() => {
    if (!user) {
      setNotifOpen(false);
      setDismissed(new Set());
    }
  }, [user]);

  const itemsQueries = useQueries({
    queries:
      conversations?.map((cv) => ({
        queryKey: ["item", cv.itemId],
        queryFn: () => fetchItem(cv.itemId),
        enabled: true,
        staleTime: 5 * 60 * 1000,
      })) ?? [],
  });

  const messagesQueries = useQueries({
    queries:
      conversations?.map((cv) => ({
        queryKey: ["messages", cv.conversationId],
        queryFn: () => listMessages(cv.conversationId),
        enabled: true,
        staleTime: 30 * 1000,
      })) ?? [],
  });

  const partnerQueries = useQueries({
    queries:
      conversations?.map((cv) => {
        const partnerUid = user?.uid === cv.sellerUid ? cv.buyerUid : cv.sellerUid;
        return {
          queryKey: ["public-user", partnerUid],
          queryFn: () => fetchPublicUser(partnerUid),
          enabled: !!partnerUid,
          staleTime: 5 * 60 * 1000,
        };
      }) ?? [],
  });

  const itemMap = useMemo(() => {
    const map = new Map<number, Awaited<ReturnType<typeof fetchItem>>>();
    itemsQueries.forEach((q, idx) => {
      if (q.data) {
        map.set(conversations![idx].itemId, q.data);
      }
    });
    return map;
  }, [itemsQueries, conversations]);

  const lastMessageMap = useMemo(() => {
    const map = new Map<number, string>();
    messagesQueries.forEach((q, idx) => {
      const msgs = q.data;
      if (msgs && msgs.length > 0) {
        map.set(conversations![idx].conversationId, msgs[msgs.length - 1].body);
      }
    });
    return map;
  }, [messagesQueries, conversations]);

  const partnerMap = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof fetchPublicUser>>>();
    partnerQueries.forEach((q, idx) => {
      const cv = conversations?.[idx];
      if (cv && q.data?.uid) {
        map.set(q.data.uid, q.data);
      }
    });
    return map;
  }, [partnerQueries, conversations]);

  const openNotifications = async () => {
    if (notifOpen) {
      setNotifOpen(false);
      return;
    }
    if (conversations && conversations.length > 0) {
      await Promise.all(
        conversations.map((c) => markConversationRead(c.conversationId).catch(() => {}))
      );
      // 楽観的に未読をクリア
      setDismissed(new Set(conversations.map((c) => c.conversationId)));
      queryClient.setQueryData(["conversations", user?.uid], (old: typeof conversations) =>
        old
          ? old.map((cv) =>
              conversations.find((c) => c.conversationId === cv.conversationId)
                ? { ...cv, hasUnread: false }
                : cv
            )
          : old
      );
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.uid] });
    }
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
                    {displayConversations.length === 0 && (
                      <p className="text-xs text-slate-500">通知はありません。</p>
                    )}
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
                        {(() => {
                          const partnerUid = cv.sellerUid === user?.uid ? cv.buyerUid : cv.sellerUid;
                          const partner = partnerUid ? partnerMap.get(partnerUid) : undefined;
                          const partnerName = partner?.displayName || partnerUid || "Unknown";
                          const partnerPhoto =
                            partner?.photoURL ||
                            "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60";
                          const itemTitle = itemMap.get(cv.itemId)?.title || `商品ID: ${cv.itemId}`;
                          const lastBody = lastMessageMap.get(cv.conversationId) || "新しいメッセージがあります";
                          const sentence = `「${itemTitle}」へのメッセージ: ${lastBody}`;
                          return (
                        <div className="flex items-start gap-2">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={partnerPhoto}
                              alt={partnerName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">
                              {itemTitle}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              相手: {partnerName}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {sentence}
                            </p>
                          </div>
                        </div>
                          );
                        })()}
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
