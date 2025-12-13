"use client";

import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ItemCard } from "@/components/item/ItemCard";
import { categories } from "@/constants/categories";
import { fetchItems } from "@/lib/api/items";
import { Item } from "@/types/item";
import { useState } from "react";

function ItemsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appliedQuery = searchParams.get("query") ?? "";
  const appliedFilter = searchParams.get("filter") ?? "";
  const [filterDraft, setFilterDraft] = useState(appliedFilter);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", { filter: appliedFilter }],
    queryFn: () => fetchItems(appliedFilter ? { category: appliedFilter } : undefined),
  });

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    const q = appliedQuery.toLowerCase();
    return items.filter((item) => {
      const matchesQuery = q
        ? item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        : true;
      return matchesQuery;
    });
  }, [items, appliedQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <Header
        onSearch={(val) => {
          const params = new URLSearchParams();
          if (val) params.set("query", val);
          if (filterDraft) params.set("filter", filterDraft);
          const qs = params.toString();
          router.push(qs ? `/items?${qs}` : "/items");
        }}
        locale="ja"
        onLocaleChange={() => {}}
        brandName="Fleamint"
        brandTagline="プレラブドマーケット"
        signupLabel="新規登録"
        searchPlaceholder="キーワードで探す"
        filterOptions={categories.filter((c) => c.slug).map((c) => ({ label: c.label, value: c.slug }))}
        selectedFilter={filterDraft}
        onFilterChange={(slug) => {
          setFilterDraft(slug);
        }}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">検索結果</h1>
            {(appliedQuery || appliedFilter) && (
              <p className="text-sm text-slate-500">
                {appliedQuery && `“${appliedQuery}” `}
                {appliedFilter && `カテゴリ: ${appliedFilter}`}
              </p>
            )}
          </div>
          <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            トップへ戻る
          </Link>
        </div>

        {isLoading && <p className="text-sm text-slate-500">読み込み中...</p>}
        {isError && <p className="text-sm text-red-600">商品を取得できませんでした。API接続を確認してください。</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">該当する商品がありません。条件を変えてお試しください。</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item: Item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>

      <Footer
        brandName="Fleamint"
        brandTagline="プレラブドマーケット"
        description="次世代フリマのUIデザイン。Next.js + Tailwind製。"
        columns={[]}
        legalLinks={[]}
        appTitle=""
        appIos=""
        appAndroid=""
      />
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">読み込み中...</div>}>
      <ItemsPageContent />
    </Suspense>
  );
}
