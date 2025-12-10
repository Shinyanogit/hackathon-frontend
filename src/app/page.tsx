"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { HeroSection } from "@/components/home/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ItemCard } from "@/components/item/ItemCard";
import { fetchItems } from "@/lib/api/items";
import { Item } from "@/types/item";

type Locale = "ja" | "en";

const categoryDefinitions = [
  { id: "all", label: { ja: "すべて", en: "All" }, keyword: "" },
  { id: "women", label: { ja: "レディース", en: "Women" }, keyword: "women" },
  { id: "men", label: { ja: "メンズ", en: "Men" }, keyword: "men" },
  { id: "kids", label: { ja: "キッズ", en: "Kids" }, keyword: "kid" },
  { id: "vintage", label: { ja: "ヴィンテージ", en: "Vintage" }, keyword: "vintage" },
  { id: "sneakers", label: { ja: "スニーカー", en: "Sneakers" }, keyword: "sneaker" },
  { id: "luxury", label: { ja: "ラグジュアリー", en: "Luxury" }, keyword: "luxury" },
  { id: "home", label: { ja: "ホーム", en: "Home" }, keyword: "home" },
  { id: "accessories", label: { ja: "アクセサリー", en: "Accessories" }, keyword: "accessor" },
];

const copy: Record<
  Locale,
  {
    brandName: string;
    brandTagline: string;
    navLinks: { href: string; label: string }[];
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
      { href: "/explore", label: "見つける" },
      { href: "/women", label: "レディース" },
      { href: "/men", label: "メンズ" },
      { href: "/kids", label: "キッズ" },
    ],
    signupLabel: "新規登録",
    searchPlaceholder: "アイテム名、ブランド、サイズで検索",
    hero: {
      badge: "次世代フリマ",
      title: "好きだった服を、次に好きな人へ。",
      description:
        "シンプルなUIと安心設計で、出品も購入もストレスなく。数秒で出品、すぐに見つかる次の持ち主。",
      primaryCta: "出品を始める",
      secondaryCta: "商品を探す",
      searchPlaceholder: "\"デニムジャケット\" \"ナイキ スニーカー\" などで検索",
      chips: ["購入者保護付き", "すぐに売れる設計", "クリーンなカードUI"],
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
      description: "次世代フリマのUIデザイン。Next.js + Tailwind製。",
      appTitle: "アプリでさらに快適",
      appIos: "iOS 版をダウンロード",
      appAndroid: "Android 版をダウンロード",
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
      { href: "/explore", label: "Explore" },
      { href: "/women", label: "Women" },
      { href: "/men", label: "Men" },
      { href: "/kids", label: "Kids" },
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
      appTitle: "Get the app",
      appIos: "Download for iOS",
      appAndroid: "Download for Android",
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

export default function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  const [locale, setLocale] = useState<Locale>("ja");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const t = copy[locale];

  const localizedCategories = categoryDefinitions.map((category) => ({
    id: category.id,
    label: category.label[locale],
  }));

  const categoryKeyword =
    categoryDefinitions.find((category) => category.id === selectedCategory)?.keyword ?? "";

  const items = data?.items ?? fallbackItems;

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === "all" ||
        categoryKeyword === "" ||
        `${item.title} ${item.description}`.toLowerCase().includes(categoryKeyword);
      return matchesQuery && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory, categoryKeyword]);

  const displayedItems = filteredItems.slice(0, 12);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-emerald-50/40">
      <Header
        onSearch={handleSearch}
        locale={locale}
        onLocaleChange={setLocale}
        brandName={t.brandName}
        brandTagline={t.brandTagline}
        navLinks={t.navLinks}
        signupLabel={t.signupLabel}
        searchPlaceholder={t.searchPlaceholder}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-16 pt-8">
        <HeroSection
          onSearch={handleSearch}
          badge={t.hero.badge}
          title={t.hero.title}
          description={t.hero.description}
          primaryCta={t.hero.primaryCta}
          secondaryCta={t.hero.secondaryCta}
          searchPlaceholder={t.hero.searchPlaceholder}
          chips={t.hero.chips}
        />

        <section className="space-y-4">
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
            categories={localizedCategories}
            activeId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        <section className="space-y-4">
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
            <p className="text-base font-semibold text-slate-900">
              Sell fast
            </p>
            <p className="text-sm text-slate-600">
              List in minutes with clean forms and instant previews.
            </p>
          </div>
          <div className="space-y-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
              🔒
            </span>
            <p className="text-base font-semibold text-slate-900">
              Safe & transparent
            </p>
            <p className="text-sm text-slate-600">
              Buyer protection and clear pricing in a clean marketplace UX.
            </p>
          </div>
          <div className="space-y-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg">
              🌱
            </span>
            <p className="text-base font-semibold text-slate-900">
              Circular by default
            </p>
            <p className="text-sm text-slate-600">
              Celebrate second-hand style with a bright, airy interface.
            </p>
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
