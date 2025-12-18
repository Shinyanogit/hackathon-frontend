"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/AppHeader";
import { fetchItems } from "@/lib/api/items";
import { fetchPublicUser } from "@/lib/api/users";
import { ItemCard } from "@/components/item/ItemCard";

export default function SellerPage() {
  const params = useParams();
  const uid = params?.uid as string | undefined;

  const userQuery = useQuery({
    queryKey: ["public-user", uid],
    queryFn: () => fetchPublicUser(uid!),
    enabled: !!uid,
  });

  const itemsQuery = useQuery({
    queryKey: ["items", { sellerUid: uid }],
    queryFn: () => fetchItems({ sellerUid: uid }),
    enabled: !!uid,
  });

  const profile = userQuery.data;
  const items = itemsQuery.data?.items ?? [];

  return (
    <div className="min-h-screen bg-white">
      <AppHeader
        onSearch={(val) => {
          const params = new URLSearchParams();
          if (val) params.set("query", val);
          window.location.href = params.toString() ? `/items?${params.toString()}` : "/items";
        }}
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-4 hover:text-emerald-800"
        >
          ← トップに戻る
        </Link>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                profile?.photoURL ||
                "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60"
              }
              alt={profile?.displayName || uid || "seller"}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{profile?.displayName || uid}</p>
            <p className="text-xs text-slate-500">{uid}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Listings</p>
              <h2 className="text-lg font-semibold text-slate-900">この出品者の出品</h2>
            </div>
          </div>
          {itemsQuery.isLoading && <p className="mt-3 text-sm text-slate-500">読み込み中...</p>}
          {!itemsQuery.isLoading && items.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">出品がありません。</p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
