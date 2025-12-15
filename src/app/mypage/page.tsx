"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuth, updateProfile } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { fetchMyItems, updateItem } from "@/lib/api/items";
import { fetchMyPurchases, fetchMySales } from "@/lib/api/purchases";
import { ItemCard } from "@/components/item/ItemCard";
import { storage } from "@/lib/firebase";
import { Header } from "@/components/layout/Header";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function MyPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"items" | "purchases" | "history" | "likes" | "settings">("items");
  const displayName = user?.displayName ?? "ゲストユーザー";
  const email = user?.email ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["me", "items"],
    queryFn: fetchMyItems,
    enabled: !!user,
  });
  const { data: myPurchases } = useQuery({
    queryKey: ["me", "purchases"],
    queryFn: fetchMyPurchases,
    enabled: !!user,
  });
  const { data: mySales } = useQuery({
    queryKey: ["me", "sales"],
    queryFn: fetchMySales,
    enabled: !!user,
  });
  const [purchaseFilter, setPurchaseFilter] = useState<"active" | "completed">("active");
  const myItems = data?.items ?? [];
  const [displayNameInput, setDisplayNameInput] = useState(displayName);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(user?.photoURL ?? null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editMessage, setEditMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const providerData = useMemo(() => user?.providerData ?? [], [user]);
  const isPasswordUser = useMemo(
    () => providerData.some((p) => p.providerId === "password"),
    [providerData]
  );
  const requiresProfileCompletion = isPasswordUser && (!user?.displayName || !user?.photoURL);
  const currentDisplayName = displayNameInput || displayName;
  const currentPhoto = iconPreview || user?.photoURL;
  const canSaveProfile =
    displayNameInput.trim().length > 0 &&
    (iconFile !== null || !!user?.photoURL || !isPasswordUser);

  const handleProfileUpdate = async () => {
    const auth = getAuth();
    if (!auth.currentUser) return;
    try {
      let photoURL = auth.currentUser.photoURL || undefined;
      if (iconFile) {
        const path = `avatars/${auth.currentUser.uid}/${Date.now()}-${iconFile.name}`;
        const snap = await uploadBytes(ref(storage, path), iconFile);
        photoURL = await getDownloadURL(snap.ref);
      }
      await updateProfile(auth.currentUser, {
        displayName: displayNameInput.trim() || undefined,
        photoURL,
      });
      setIconFile(null);
      setIconPreview(photoURL ?? null);
      setProfileMessage("プロフィールを更新しました。再読み込みで反映されます。");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "プロフィール更新に失敗しました。ログイン状態を確認してください。";
      setProfileMessage(msg);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const startEdit = (item: (typeof myItems)[number]) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditPrice(item.price);
    setEditImageUrl(item.imageUrl ?? "");
    setEditCategory(item.categorySlug);
    setEditMessage(null);
  };

  const submitEdit = async () => {
    if (!editingId) return;
    try {
      await updateItem(editingId, {
        title: editTitle,
        description: editDescription,
        price: typeof editPrice === "number" ? editPrice : undefined,
        imageUrl: editImageUrl || undefined,
        categorySlug: editCategory,
      });
      setEditMessage("更新しました");
      queryClient.invalidateQueries({ queryKey: ["me", "items"] });
      setEditingId(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "更新に失敗しました";
      setEditMessage(msg);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-24 w-48 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  if (!user) return null;

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
        searchPlaceholder=""
        hideSearch
      />
      <main className="min-h-screen bg-white px-4 py-10">
        <div className="mx-auto flex max-w-5xl flex-col space-y-8">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowProfileSettings((p) => !p)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  詳細設定
                </button>
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

            {showProfileSettings && (
              <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                    <label className="text-sm font-semibold text-slate-800">言語</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={"ja"}
                      onChange={() => {}}
                    >
                      <option value="ja">日本語</option>
                      <option value="en">English</option>
                    </select>
                    <p className="text-xs text-slate-500">※ 現状は日本語固定（後で切替実装）</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">アイコン画像</label>
                  <div className="flex flex-wrap items-center gap-3">
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
                  </div>
                  {iconPreview && (
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={iconPreview} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleProfileUpdate}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    disabled={loading || !canSaveProfile}
                  >
                    プロフィールを更新
                  </button>
                  {profileMessage && <p className="text-xs text-slate-500">{profileMessage}</p>}
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "items", label: "自分の出品" },
              { key: "purchases", label: "取引・購入" },
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="例）山田太郎"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">アイコン画像</label>
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
                      required
                    />
                    画像を選択
                  </label>
                  {iconPreview && (
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={iconPreview} alt="preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleProfileUpdate}
                disabled={!displayNameInput.trim() || (!iconFile && !iconPreview)}
                className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                プロフィールを更新
              </button>
              {profileMessage && <p className="mt-2 text-xs text-slate-500">{profileMessage}</p>}
            </section>
          )}

          {tab === "items" && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-8">
              <div>
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
                    <div key={item.id} className="space-y-2">
                      <ItemCard item={item} />
                      <button
                        onClick={() => startEdit(item)}
                        className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        編集
                      </button>
                    </div>
                  ))}
                </div>
                {editingId && (
                  <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">出品内容を編集（ID: {editingId}）</p>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="タイトル"
                    />
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="説明"
                      rows={3}
                    />
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="価格"
                    />
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="画像URL"
                    />
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    >
                      <option value="">カテゴリを選択</option>
                      {categories
                        .filter((c) => c.slug)
                        .map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.label}
                          </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={submitEdit}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        更新する
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        キャンセル
                      </button>
                      {editMessage && <span className="text-xs text-slate-500">{editMessage}</span>}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Sales
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">取引中 / 売却済み（出品分）</h3>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  自分が出品して購入された商品のステータスです（発送待ち / 発送済み / 受取完了 / キャンセル）。
                </p>
                {!mySales && <p className="mt-4 text-sm text-slate-500">読み込み中...</p>}
                {mySales && mySales.length === 0 && (
                  <p className="mt-4 text-sm text-slate-500">まだ取引中の商品はありません。</p>
                )}
                <div className="mt-4 grid gap-4">
                  {mySales?.map((row) => (
                    <div
                      key={row.purchase.id}
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              row.item.imageUrl && row.item.imageUrl.trim() !== ""
                                ? row.item.imageUrl
                                : "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80"
                            }
                            alt={row.item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {row.item.title || `商品 #${row.purchase.itemId}`}
                          </p>
                          <p className="text-xs text-slate-500">¥{row.item.price?.toLocaleString?.() ?? "-"}</p>
                          <p className="text-xs text-slate-500">ステータス: {row.purchase.status}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/items/${row.purchase.itemId}`}
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                          商品ページ
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
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

          {tab === "purchases" && (
            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Purchases
                  </p>
                  <h2 className="text-lg font-semibold text-slate-900">取引中 / 購入済み</h2>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                自分が購入した商品のステータスです（発送待ち / 発送済み / 受取完了 / キャンセル）。
              </p>
              <div className="mt-3 flex gap-2">
                {[
                  { key: "active", label: "取引中（発送待ち/発送済み）" },
                  { key: "completed", label: "購入済み（受取完了）" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setPurchaseFilter(f.key as typeof purchaseFilter)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      purchaseFilter === f.key
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-200 hover:text-emerald-700"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {!myPurchases && <p className="mt-4 text-sm text-slate-500">読み込み中...</p>}
              {myPurchases && myPurchases.length === 0 && (
                <p className="mt-4 text-sm text-slate-500">購入履歴がまだありません。</p>
              )}
              <div className="mt-4 grid gap-4">
                {myPurchases
                  ?.filter((row) =>
                    purchaseFilter === "active"
                      ? row.purchase.status === "pending_shipment" || row.purchase.status === "shipped"
                      : row.purchase.status === "delivered"
                  )
                  .map((row) => (
                  <div
                    key={row.purchase.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            row.item.imageUrl && row.item.imageUrl.trim() !== ""
                              ? row.item.imageUrl
                              : "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={row.item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                          {row.item.title || `商品 #${row.purchase.itemId}`}
                        </p>
                        <p className="text-xs text-slate-500">¥{row.item.price?.toLocaleString?.() ?? "-"}</p>
                        <p className="text-xs text-slate-500">
                          ステータス: {row.purchase.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/items/${row.purchase.itemId}`}
                        className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        商品ページ
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
import { categories } from "@/constants/categories";
