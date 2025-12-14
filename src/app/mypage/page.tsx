"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuth, updateProfile } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { fetchMyItems } from "@/lib/api/items";
import { ItemCard } from "@/components/item/ItemCard";
import { Header } from "@/components/layout/Header";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function MyPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"items" | "history" | "likes" | "settings">("items");

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

  const { data, isLoading } = useQuery({
    queryKey: ["me", "items"],
    queryFn: fetchMyItems,
  });
  const myItems = data?.items ?? [];
  const [displayNameInput, setDisplayNameInput] = useState(displayName);
  const [photoInput, setPhotoInput] = useState(user.photoURL ?? "");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(user.photoURL ?? null);

  useEffect(() => {
    setDisplayNameInput(user.displayName ?? "");
    setPhotoInput(user.photoURL ?? "");
  }, [user]);

  const providerData = user?.providerData ?? [];
  const isPasswordUser = useMemo(
    () => providerData.some((p) => p.providerId === "password"),
    [providerData]
  );
  const requiresProfileCompletion = isPasswordUser && (!user?.displayName || !user?.photoURL);
  const currentDisplayName = displayNameInput || displayName;
  const currentPhoto = photoInput || user?.photoURL;
  const canSaveProfile =
    displayNameInput.trim().length > 0 &&
    (photoInput.trim().length > 0 || iconFile !== null || !!user?.photoURL || !isPasswordUser);

  const handleProfileUpdate = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    let photoURL = photoInput.trim() || undefined;
    if (iconFile) {
      const path = `avatars/${auth.currentUser.uid}/${Date.now()}-${iconFile.name}`;
      const snap = await uploadBytes(ref(storage, path), iconFile);
      photoURL = await getDownloadURL(snap.ref);
    }
    await updateProfile(auth.currentUser, {
      displayName: displayNameInput.trim() || undefined,
      photoURL,
    });
    setPhotoInput(photoURL ?? "");
    setIconFile(null);
    setProfileMessage("プロフィールを更新しました。再読み込みで反映されます。");
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <>
      <Header
        onSearch={(val) => {
          const params = new URLSearchParams();
          if (val) params.set("query", val);
          router.push(params.toString() ? `/items?${params.toString()}` : "/items");
        }}
        locale="ja"
        onLocaleChange={() => {}}
        brandName="Fleamint"
        brandTagline="プレラブドマーケット"
        signupLabel="新規登録"
        searchPlaceholder="アイテム名で検索"
      />
      <main className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col space-y-8">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPhoto}
                alt={currentDisplayName}
                className="h-14 w-14 rounded-full object-cover"
                width={56}
                height={56}
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
                {currentDisplayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-xl font-semibold text-slate-900">{currentDisplayName}</p>
              <p className="text-sm text-slate-500">{email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            >
              トップに戻る
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            >
              ログアウト
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Profile
              </p>
              <h2 className="text-lg font-semibold text-slate-900">プロフィール設定</h2>
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-600">表示名とアイコンURLを変更できます。</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">表示名</label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                placeholder="例）山田太郎"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">アイコン画像</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setIconFile(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setIconPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      } else {
                        setIconPreview(null);
                      }
                    }}
                  />
                  画像を選択
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="URLを直接入力することもできます"
                />
              </div>
              {iconPreview && (
                <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={iconPreview} alt="preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleProfileUpdate}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              disabled={loading || !canSaveProfile}
            >
              プロフィールを更新
            </button>
            {profileMessage && <p className="text-xs text-slate-500">{profileMessage}</p>}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "items", label: "自分の出品" },
            { key: "history", label: "閲覧履歴" },
            { key: "likes", label: "いいねした商品" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-200 hover:text-emerald-700"
              }`}
            >
              {t.label}
            </button>
          ))}
          <Link
            href="/"
            className="ml-auto rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            トップに戻る
          </Link>
        </div>

        {requiresProfileCompletion && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-amber-800">
              プロフィールを設定してください（メール登録では必須です）
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">表示名</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  placeholder="例）山田太郎"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">アイコンURL</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  required
                />
              </div>
            </div>
            <button
              onClick={handleProfileUpdate}
              disabled={!displayNameInput.trim() || !photoInput.trim()}
              className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              プロフィールを更新
            </button>
            {profileMessage && <p className="mt-2 text-xs text-slate-500">{profileMessage}</p>}
          </section>
        )}

        {tab === "items" && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  My Listings
                </p>
                <h2 className="text-lg font-semibold text-slate-900">あなたの出品</h2>
              </div>
              <Link
                href="/sell"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                出品する
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">出品中の商品がここに表示されます。</p>
            {isLoading && <p className="mt-4 text-sm text-slate-500">読み込み中...</p>}
            {!isLoading && myItems.length === 0 && (
              <p className="mt-4 text-sm text-slate-500">まだ出品がありません。</p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {tab === "history" && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  History
                </p>
                <h2 className="text-lg font-semibold text-slate-900">閲覧履歴</h2>
              </div>
              <Link
                href="/items"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                新着を見る
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              閲覧した商品がここに表示されます。履歴連携は今後追加予定です。
            </p>
          </section>
        )}

        {tab === "likes" && (
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Likes
                </p>
                <h2 className="text-lg font-semibold text-slate-900">いいねした商品</h2>
              </div>
              <Link
                href="/items"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                商品一覧へ
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">いいね一覧は今後追加予定です。</p>
          </section>
        )}
        </div>
      </main>
    </>
  );
}
