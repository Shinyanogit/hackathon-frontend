"use client";

import { useRouter } from "next/navigation";
import { Header } from "./Header";

type Props = {
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
  filterOptions?: { label: string; value: string }[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  initialQuery?: string;
};

/**
 * Common header wrapper with app-wide defaults.
 * Falls back to pushing to /items?query=... when onSearchが未指定.
 */
export function AppHeader({
  onSearch,
  hideSearch,
  filterOptions,
  selectedFilter,
  onFilterChange,
  initialQuery,
}: Props) {
  const router = useRouter();
  const handleSearch =
    onSearch ??
    ((val: string) => {
      const params = new URLSearchParams();
      if (val) params.set("query", val);
      router.push(params.toString() ? `/items?${params.toString()}` : "/items");
    });

  return (
    <Header
      onSearch={handleSearch}
      locale="ja"
      onLocaleChange={() => {}}
      brandName="Fleamint"
      brandTagline="シンプルフリマ"
      signupLabel="新規登録"
      searchPlaceholder="キーワードで探す"
      filterOptions={filterOptions}
      selectedFilter={selectedFilter}
      onFilterChange={onFilterChange}
      hideSearch={hideSearch}
      initialQuery={initialQuery}
    />
  );
}
