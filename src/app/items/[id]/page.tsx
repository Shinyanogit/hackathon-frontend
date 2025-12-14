"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { ChatBox } from "@/components/item/ChatBox";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { fetchItem, updateItem } from "@/lib/api/items";
import { fetchPublicUser } from "@/lib/api/users";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";

export default function ItemDetailPage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const conversationIdParam = searchParams.get("conversationId");
  const initialConversationId = conversationIdParam ? Number(conversationIdParam) : null;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) throw new Error("missing id");
      return fetchItem(id as string);
    },
  });

  const fallbackImage =
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80";
  const { data: sellerProfile } = useQuery({
    queryKey: ["public-user", data?.sellerUid],
    queryFn: () => fetchPublicUser(data!.sellerUid),
    enabled: !!data?.sellerUid,
  });
  const sellerName =
    sellerProfile?.displayName ||
    (data?.sellerUid === user?.uid ? user?.displayName : undefined) ||
    data?.sellerUid ||
    "Unknown seller";
  const sellerPhoto =
    sellerProfile?.photoURL ||
    (data?.sellerUid === user?.uid ? user?.photoURL : undefined) ||
    "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60";

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("query", value);
    // stay on items page with search
    window.location.href = params.toString() ? `/items?${params.toString()}` : "/items";
  };

  const isOwner = user?.uid && data?.sellerUid === user.uid;

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.price);
    setCategory(data.categorySlug);
    setImagePreview(data.imageUrl ?? null);
  }, [data]);

  const handleSave = async () => {
    if (!isOwner || !id) return;
    setSaving(true);
    setMessage(null);
    try {
      let imageUrl = imagePreview ?? undefined;
      if (imageFile) {
        const path = `items/${user!.uid}/${Date.now()}-${imageFile.name}`;
        const snap = await uploadBytes(ref(storage, path), imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }
      await updateItem(id as string, {
        title,
        description,
        price: typeof price === "number" ? price : undefined,
        categorySlug: category,
        imageUrl,
      });
      await queryClient.invalidateQueries({ queryKey: ["item", id] });
      setEditing(false);
      setImageFile(null);
      setMessage("更新しました");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "更新に失敗しました";
      setMessage(msg);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || isError || !data) {
    return (
      <>
        <Header
          onSearch={handleSearch}
          locale="ja"
          onLocaleChange={() => {}}
          brandName="Fleamint"
          brandTagline="プレラブドマーケット"
          signupLabel="新規登録"
          searchPlaceholder="キーワードで探す"
        />
        <div className="mx-auto max-w-3xl px-4 py-12">
          {isError ? (
            notFound()
          ) : (
            <p className="text-sm text-neutral-500">Loading item...</p>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        onSearch={handleSearch}
        locale="ja"
        onLocaleChange={() => {}}
        brandName="Fleamint"
        brandTagline="プレラブドマーケット"
        signupLabel="新規登録"
        searchPlaceholder="キーワードで探す"
      />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-4 hover:text-emerald-800"
        >
          ← トップに戻る
        </Link>
        <div className="mt-4 grid gap-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : fallbackImage}
              alt={data.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              #{data.id}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                商品詳細
              </p>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{data.title}</h1>
              <p className="text-sm text-slate-500">
                {new Date(data.createdAt).toLocaleString()}
                {data.categorySlug ? ` · カテゴリ: ${data.categorySlug}` : ""}
              </p>
            </div>
            {data.sellerUid && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Link
                  href={`/seller/${data.sellerUid}`}
                  className="flex items-center gap-3 hover:opacity-90"
                >
                  <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        sellerPhoto
                      }
                      alt={sellerName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {sellerName}
                    </p>
                    <p className="text-xs text-slate-500">出品者の出品をすべて見る</p>
                  </div>
                </Link>
              </div>
            )}
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-lg font-semibold text-slate-900">¥{data.price.toLocaleString()}</p>
            </div>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {data.description}
            </p>
            {data.imageUrl && (
              <div>
                <a
                  href={data.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  画像を開く
                </a>
              </div>
            )}
            {isOwner && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">出品内容を編集</p>
                  <button
                    onClick={() => setEditing((v) => !v)}
                    className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    {editing ? "閉じる" : "開く"}
                  </button>
                </div>
                {editing && (
                  <div className="space-y-3">
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="タイトル"
                    />
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="説明"
                      rows={3}
                    />
                    <input
                      type="number"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={price}
                      onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="価格"
                    />
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
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
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800">画像ファイル</label>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setImageFile(f);
                            if (f) {
                              const reader = new FileReader();
                              reader.onload = () => setImagePreview(reader.result as string);
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                        画像を選択
                      </label>
                      {imagePreview && (
                        <div className="h-32 w-32 overflow-hidden rounded-lg border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        保存する
                      </button>
                      {message && <span className="text-xs text-slate-600">{message}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <ChatBox
          itemId={Number(data.id)}
          sellerUid={data.sellerUid}
          currentUid={user?.uid}
          initialConversationId={initialConversationId}
        />
      </div>
    </div>
  );
}
import { categories } from "@/constants/categories";
