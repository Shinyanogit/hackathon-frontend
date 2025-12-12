"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-24 w-48 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  if (!user) return null;

  const displayName = user.displayName ?? "ゲストユーザー";
  const email = user.email ?? "";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={displayName}
              className="h-14 w-14 rounded-full object-cover"
              width={56}
              height={56}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-xl font-semibold text-slate-900">{displayName}</p>
            <p className="text-sm text-slate-500">{email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
        >
          ログアウト
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">あなたの出品</h2>
          <Link
            href="/sell"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            出品する
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          出品中の商品がここに表示されます。まだありません。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">閲覧履歴</h2>
          <Link
            href="/items"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            もっと見る
          </Link>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          閲覧した商品がここに表示されます。履歴連携は今後追加予定です。
        </p>
      </section>
    </main>
  );
}
