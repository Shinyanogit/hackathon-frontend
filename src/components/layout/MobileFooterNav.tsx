"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const SearchIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="6" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SellIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M12 5v14M5 12h14" />
    <rect x="3" y="3" width="18" height="18" rx="4" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/items", label: "商品を探す", Icon: SearchIcon },
  { href: "/sell", label: "出品を始める", Icon: SellIcon },
  { href: "/mypage", label: "マイページ", Icon: UserIcon },
];

export function MobileFooterNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-5xl items-stretch justify-around px-2 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-semibold transition ${
                  active ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <item.Icon
                  className={`h-5 w-5 ${active ? "text-emerald-700" : "text-slate-500"}`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
