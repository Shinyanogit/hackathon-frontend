"use client";

import { Suspense, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { HeroSection } from "@/components/home/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ItemCard } from "@/components/item/ItemCard";
import { categories } from "@/constants/categories";
import { fetchItems } from "@/lib/api/items";
import { Item } from "@/types/item";

type Locale = "ja" | "en";

const copy: Record<
  Locale,
  {
    brandName: string;
    brandTagline: string;
    navLinks: { href: string; label: string; icon: "compass" | "jacket" | "dress" | "toy" }[];
    signupLabel: string;
    searchPlaceholder: string;
    hero: {
      badge: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
      searchPlaceholder: string;
      chips: string[];
    };
    categoryHeading: string;
    categorySubheading: string;
    itemsSectionTitle: string;
    seeAll: string;
    loading: string;
    error: string;
    empty: string;
    statsLabel: (count: number) => string;
    footer: {
      description: string;
      columns: {
        title: string;
        links: { label: string; href: string }[];
      }[];
      legal: { label: string; href: string }[];
      appTitle: string;
      appIos: string;
      appAndroid: string;
    };
  }
> = {
  ja: {
    brandName: "Fleamint",
    brandTagline: "プレラブドマーケット",
    navLinks: [
      { href: "/explore", label: "見つける", icon: "compass" },
      { href: "/men", label: "メンズ", icon: "jacket" },
      { href: "/women", label: "レディース", icon: "dress" },
      { href: "/kids", label: "キッズ", icon: "toy" },
    ],
    signupLabel: "新規登録",
    searchPlaceholder: "アイテム名、ブランド、サイズで検索",
    hero: {
      badge: "次世代フリマ",
      title: "綺麗になる部屋、\n綺麗になる地球。",
      description:
        "部屋の邪魔者をスムーズ出品。\n資源を有効活用。",
      primaryCta: "出品を始める",
      secondaryCta: "商品を探す",
      searchPlaceholder: "\"デニムジャケット\" \"ナイキ スニーカー\" などで検索",
      chips: ["購入者保護付き", "すぐに売れる設計"],
    },
    categoryHeading: "カテゴリから探す",
    categorySubheading: "スタイルに合わせてブラウズ",
    itemsSectionTitle: "新着アイテム",
    seeAll: "すべて見る",
    loading: "読み込み中...",
    error: "商品を取得できませんでした。API接続を確認してください。",
    empty: "該当する商品がありません。別のキーワードで試してください。",
    statsLabel: (count) => `${count} 点`,
    footer: {
      description: "洗練されたマーケット体験を提供します。",
      appTitle: "",
      appIos: "",
      appAndroid: "",
      columns: [
        {
          title: "マーケットプレイス",
          links: [
            { label: "新着一覧", href: "/items" },
            { label: "出品する", href: "/sell" },
            { label: "カテゴリ", href: "/explore" },
            { label: "サイズガイド", href: "/" },
            { label: "ギフトカード", href: "/" },
          ],
        },
        {
          title: "ヘルプ",
          links: [
            { label: "サポート", href: "/" },
            { label: "安全のために", href: "/" },
            { label: "発送について", href: "/" },
            { label: "返品・返金", href: "/" },
            { label: "お問い合わせ", href: "/" },
          ],
        },
        {
          title: "会社情報",
          links: [
            { label: "Fleamint とは", href: "/" },
            { label: "採用情報", href: "/" },
            { label: "プレス", href: "/" },
            { label: "サステナビリティ", href: "/" },
            { label: "利用規約", href: "/" },
          ],
        },
      ],
      legal: [
        { label: "プライバシー", href: "/" },
        { label: "利用規約", href: "/" },
        { label: "クッキー", href: "/" },
      ],
    },
  },
  en: {
    brandName: "Fleamint",
    brandTagline: "Preloved market",
    navLinks: [
      { href: "/explore", label: "Explore", icon: "compass" },
      { href: "/men", label: "Men", icon: "jacket" },
      { href: "/women", label: "Women", icon: "dress" },
      { href: "/kids", label: "Kids", icon: "toy" },
    ],
    signupLabel: "Sign up",
    searchPlaceholder: "Search items, brands, sizes",
    hero: {
      badge: "Next-gen marketplace",
      title: "Pass on what you loved. Find what you’ll love next.",
      description:
        "Clean cards, transparent pricing, and buyer protection. List in seconds and reach the right buyers fast.",
      primaryCta: "Start selling",
      secondaryCta: "Browse items",
      searchPlaceholder: "Try \"denim jacket\", \"Nike sneakers\", or \"vintage bag\"",
      chips: ["Buyer protection", "Fast payouts", "Clutter-free cards"],
    },
    categoryHeading: "Browse by category",
    categorySubheading: "Curated picks for every style",
    itemsSectionTitle: "Fresh on the marketplace",
    seeAll: "See all",
    loading: "Loading items...",
    error: "Failed to load items. Check the API connection.",
    empty: "No items match your filters yet. Try a different search.",
    statsLabel: (count) => `${count} items`,
    footer: {
      description: "A modern resale experience built with Next.js and Tailwind.",
      appTitle: "",
      appIos: "",
      appAndroid: "",
      columns: [
        {
          title: "Marketplace",
          links: [
            { label: "Discover", href: "/items" },
            { label: "Sell an item", href: "/sell" },
            { label: "Categories", href: "/explore" },
            { label: "Size guide", href: "/" },
            { label: "Gift cards", href: "/" },
          ],
        },
        {
          title: "Help",
          links: [
            { label: "Support", href: "/" },
            { label: "Safety tips", href: "/" },
            { label: "Shipping", href: "/" },
            { label: "Returns", href: "/" },
            { label: "Contact", href: "/" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "/" },
            { label: "Careers", href: "/" },
            { label: "Press", href: "/" },
            { label: "Sustainability", href: "/" },
            { label: "Terms", href: "/" },
          ],
        },
      ],
      legal: [
        { label: "Privacy", href: "/" },
        { label: "Terms", href: "/" },
        { label: "Cookies", href: "/" },
      ],
    },
  },
};

const fallbackItems: Item[] = [
  {
    id: 101,
    title: "Cozy wool cardigan",
    description: "Soft beige knit, perfect for layering.",
    price: 6200,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 102,
    title: "Minimal leather sneakers",
    description: "Off-white leather with gum sole, gently worn.",
    price: 8800,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 103,
    title: "Denim trucker jacket",
    description: "Vintage wash, boxy fit, size M.",
    price: 7400,
    imageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 104,
    title: "Canvas tote bag",
    description: "Heavyweight canvas, oversized silhouette.",
    price: 3200,
    imageUrl:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 105,
    title: "Pleated midi skirt",
    description: "Satin finish, warm taupe tone, size S.",
    price: 5600,
    imageUrl:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 106,
    title: "Relaxed striped tee",
    description: "Breton stripe with dropped shoulder.",
    price: 2400,
    imageUrl:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 107,
    title: "Monochrome running shoes",
    description: "Lightweight mesh upper, size 27cm.",
    price: 9200,
    imageUrl:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 108,
    title: "Structured blazer",
    description: "Clean lapels, charcoal gray, size L.",
    price: 10400,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [locale, setLocale] = useState<Locale>("ja");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilterCategory, setSearchFilterCategory] = useState("");

  const activeCategorySlug = searchParams.get("category") ?? "";

  const t = copy[locale];

  const localizedCategories = useMemo(
    () =>
      categories.map((category) => ({
        id: category.slug || "all",
        label: category.label,
        slug: category.slug,
        children: category.children,
      })),
    []
  );

  const activeParentSlug =
    localizedCategories.find((c) => c.slug === activeCategorySlug)?.slug ??
    localizedCategories.find((c) => c.children?.some((child) => child.slug === activeCategorySlug))?.slug ??
    "";

  const activeChildren =
    localizedCategories.find((c) => c.slug === activeParentSlug)?.children ?? [];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["items", { category: activeCategorySlug }],
    queryFn: () => fetchItems(activeCategorySlug ? { category: activeCategorySlug } : undefined),
  });

  const items = data?.items ?? fallbackItems;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        activeCategorySlug === "" || item.categorySlug === undefined || item.categorySlug === activeCategorySlug;
      return matchesCategory;
    });
  }, [items, activeCategorySlug]);

  const displayedItems = filteredItems.slice(0, 12);
  const heroItems = useMemo(() => items.slice(0, 10), [items]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams();
    if (value) params.set("query", value);
    if (searchFilterCategory) params.set("filter", searchFilterCategory);
    router.push(params.toString() ? `/items?${params.toString()}` : "/items");
  };

  const handleSelectCategory = (slug: string) => {
    const normalized = slug === "all" ? "" : slug;
    const params = new URLSearchParams(searchParams.toString());
    if (normalized) {
      params.set("category", normalized);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearchFilterChange = (slug: string) => {
    setSearchFilterCategory(slug);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <Header
        onSearch={handleSearch}
        locale={locale}
        onLocaleChange={setLocale}
        brandName={t.brandName}
        brandTagline={t.brandTagline}
        signupLabel={t.signupLabel}
        searchPlaceholder={t.searchPlaceholder}
        filterOptions={localizedCategories
          .filter((c) => c.slug)
          .map((c) => ({ label: c.label, value: c.slug }))}
        selectedFilter={searchFilterCategory}
        onFilterChange={handleSearchFilterChange}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-16 pt-8">
        <HeroSection
          badge={t.hero.badge}
          title={t.hero.title}
          description={t.hero.description}
          primaryCta={t.hero.primaryCta}
          secondaryCta={t.hero.secondaryCta}
          chips={t.hero.chips}
          featuredItems={heroItems}
        />

        <section className="space-y-4" id="categories-section">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.categoryHeading}
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {t.categorySubheading}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                {t.statsLabel(data?.total ?? items.length)}
              </span>
              {searchQuery && (
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">
                  “{searchQuery}”
                </span>
              )}
            </div>
          </div>
          <CategoryTabs
            categories={localizedCategories.map((c) => ({ id: c.slug || "all", label: c.label }))}
            activeId={activeParentSlug || "all"}
            onSelect={handleSelectCategory}
          />
          {activeChildren.length > 0 && (
            <div className="pt-2">
              <CategoryTabs
                categories={activeChildren.map((c) => ({ id: c.slug, label: c.label }))}
                activeId={activeCategorySlug}
                onSelect={handleSelectCategory}
              />
            </div>
          )}
        </section>

        <section className="space-y-4" id="items-section">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{t.itemsSectionTitle}</h3>
            <Link
              href="/items"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {t.seeAll}
            </Link>
          </div>
          {isLoading && <p className="text-sm text-slate-500">{t.loading}</p>}
          {isError && <p className="text-sm text-red-600">{t.error}</p>}
          {!isLoading && displayedItems.length === 0 && (
            <p className="text-sm text-slate-500">{t.empty}</p>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:grid-cols-3">
          <div className="space-y-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
              💸
            </span>
            <p className="text-base font-semibold text-slate-900">すぐ売れる</p>
            <p className="text-sm text-slate-600">シンプルなフォームで数分で出品、プレビューで安心。</p>
          </div>
          <div className="space-y-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
              🔒
            </span>
            <p className="text-base font-semibold text-slate-900">安心・透明</p>
            <p className="text-sm text-slate-600">購入者保護と分かりやすい価格で、安心して取引できます。</p>
          </div>
          <div className="space-y-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
              🌱
            </span>
            <p className="text-base font-semibold text-slate-900">循環を楽しむ</p>
            <p className="text-sm text-slate-600">明るく軽やかなUIで、セカンドハンドをもっと心地よく。</p>
          </div>
        </section>
      </main>
      <Footer
        brandName={t.brandName}
        brandTagline={t.brandTagline}
        description={t.footer.description}
        columns={t.footer.columns}
        legalLinks={t.footer.legal}
        appTitle={t.footer.appTitle}
        appIos={t.footer.appIos}
        appAndroid={t.footer.appAndroid}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">読み込み中...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
