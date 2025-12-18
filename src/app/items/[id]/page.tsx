"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { ChatBox } from "@/components/item/ChatBox";
import { GeminiAsk } from "@/components/item/GeminiAsk";
import { PurchasePanel } from "@/components/item/PurchasePanel";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/constants/categories";
import { estimateItemCO2, fetchItem, updateItem } from "@/lib/api/items";
import { fetchPurchase } from "@/lib/api/purchases";
import { fetchPublicUser } from "@/lib/api/users";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ApiError } from "@/lib/apiClient";
import { enhanceImage } from "@/lib/api/ai";
import { useEffect, useState } from "react";
import type React from "react";
import { MobileFooterNav } from "@/components/layout/MobileFooterNav";

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
  const [showImageModal, setShowImageModal] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) throw new Error("missing id");
      return fetchItem(id as string);
    },
  });
  const { data: purchase, refetch: refetchPurchase } = useQuery({
    queryKey: ["purchase", id, user?.uid],
    queryFn: () => fetchPurchase(id as string),
    enabled: !!id && !!user,
  });
  const activePurchase = purchase?.status === "canceled" ? null : purchase;
  const isSold = data?.status === "sold" || data?.status === "in_transaction";

  const fallbackImage =
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80";
  const sellerUid = data?.sellerUid;
  const { data: sellerProfile } = useQuery({
    queryKey: ["public-user", sellerUid],
    queryFn: () => fetchPublicUser(sellerUid as string),
    enabled: !!sellerUid,
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

  const isOwner = !!(user?.uid && data?.sellerUid === user.uid);
  const isBuyer = !!(activePurchase && user?.uid && activePurchase.buyerUid === user.uid);
  const soldViewOnly = isSold && !isOwner && !isBuyer;
  const TREE_CO2_KG_PER_YEAR = 10;
  const treeYears =
    data?.co2Kg != null ? Number((data.co2Kg / TREE_CO2_KG_PER_YEAR).toFixed(1)) : null;
  const treePoints =
    treeYears != null && treeYears > 0 ? Math.max(1, Math.round(treeYears)) : null;
  const [estimating, setEstimating] = useState(false);
  const [estimateMsg, setEstimateMsg] = useState<string | null>(null);

  const runEstimate = async () => {
    if (!id) return;
    setEstimating(true);
    setEstimateMsg(null);
    try {
      const res = await estimateItemCO2(id as string);
      setEstimateMsg(
        res.co2Kg != null ? `推定CO2: ${res.co2Kg.toFixed(1)} kgCO2e` : "推定できませんでした"
      );
      await queryClient.invalidateQueries({ queryKey: ["item", id] });
    } catch (e) {
      const msg =
        e instanceof ApiError && (e.status === 504 || e.status === 502)
          ? "再計算に失敗しました。時間をおいて再試行してください（timeout）"
          : e instanceof Error
            ? e.message
            : "推定に失敗しました";
      setEstimateMsg(msg);
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setDescription(data.description);
    setPrice(data.price);
    setCategory(data.categorySlug ?? "");
    setImagePreview(data.imageUrl ?? null);
  }, [data]);

  const handleLocalFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setImageFile(file);
    setAiMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    handleLocalFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      handleLocalFile(f);
    }
  };

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
        <AppHeader onSearch={handleSearch} />
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
      <AppHeader onSearch={handleSearch} />
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-12">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-200 underline-offset-4 hover:text-emerald-800"
        >
          ← トップに戻る
        </Link>
        <div className="mt-4 grid gap-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-[1.2fr_1fr]">
          <div
            className="relative overflow-hidden rounded-2xl bg-slate-100 cursor-zoom-in"
            onClick={() => setShowImageModal(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl && data.imageUrl.trim() !== "" ? data.imageUrl : fallbackImage}
              alt={data.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {soldViewOnly && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-full border border-white/70 bg-white/80 px-6 py-3 text-3xl font-extrabold uppercase tracking-[0.4em] text-slate-900 shadow-lg">
                  SOLD
                </span>
              </div>
            )}
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
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {data.description}
            </p>
            {estimateMsg && <p className="text-xs text-slate-600">{estimateMsg}</p>}
            {!isOwner && !soldViewOnly && (
              <GeminiAsk
                itemId={Number(data.id)}
                item={{
                  title: data.title,
                  description: data.description,
                  price: data.price,
                  categorySlug: data.categorySlug,
                }}
              />
            )}
            <PurchasePanel
              itemId={Number(data.id)}
              price={data.price}
              treeYears={treeYears}
              treePoints={treePoints}
              sellerUid={data.sellerUid}
              purchase={activePurchase ?? null}
              itemStatus={data.status as any}
              onChanged={() => {
                refetchPurchase();
              }}
            />
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
                      min={100}
                      step={1}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                      value={price}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPrice("");
                          return;
                        }
                        const num = Math.max(100, Math.floor(Number(val)));
                        setPrice(num);
                      }}
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
                      <div
                        className={`flex flex-col gap-2 rounded-lg border border-dashed px-3 py-4 text-sm transition sm:flex-row sm:items-center ${
                          isDragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDragging(false);
                        }}
                        onDrop={handleDrop}
                      >
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                          <span>画像ファイルを選択</span>
                        </label>
                        <div className="text-xs text-slate-500">またはここにドラッグ＆ドロップ</div>
                        {imageFile && <span className="text-xs text-slate-500">選択中: {imageFile.name}</span>}
                      </div>
                      {imagePreview && (
                        <div
                          className="h-32 w-32 overflow-hidden rounded-lg border border-slate-200 cursor-zoom-in"
                          onClick={() => setShowImageModal(true)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                      >
                        保存する
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!imageFile) {
                            setAiMessage("先に画像ファイルを選択してください");
                            return;
                          }
                          try {
                            setAiEnhancing(true);
                            setAiMessage("AIで背景を補正中…");
                            const res = await enhanceImage({
                              image: imageFile,
                              itemId: String(id),
                              category: category || data.categorySlug,
                              mode: "auto",
                              background: "white",
                            });
                            setImagePreview(res.enhancedUrl);
                            setImageFile(null);
                            setAiMessage("背景を白でクリーンアップしました");
                          } catch (e: unknown) {
                            const msg = e instanceof Error ? e.message : "AI背景補正に失敗しました";
                            setAiMessage(msg);
                          } finally {
                            setAiEnhancing(false);
                          }
                        }}
                        disabled={aiEnhancing || saving}
                        className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
                      >
                        {aiEnhancing ? "AI補正中..." : "AIで背景をきれいにする"}
                      </button>
                      <button
                        type="button"
                        onClick={runEstimate}
                        disabled={estimating}
                        className="rounded-full border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-400"
                      >
                        {estimating ? "査定中..." : "CO2を再計算"}
                      </button>
                      {message && <span className="text-xs text-slate-600">{message}</span>}
                      {aiMessage && <span className="text-xs text-slate-600">{aiMessage}</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div id="dm">
          {soldViewOnly ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-600">
              この商品は売り切れのため質問やDMは利用できません。
            </div>
          ) : (
            <ChatBox
              itemId={Number(data.id)}
              sellerUid={data.sellerUid}
              currentUid={user?.uid}
              initialConversationId={initialConversationId}
              purchaseConversationId={activePurchase?.conversationId ?? null}
            />
          )}
        </div>
      </div>
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                imagePreview
                  ? imagePreview
                  : data.imageUrl && data.imageUrl.trim() !== ""
                    ? data.imageUrl
                    : fallbackImage
              }
              alt={data.title}
              className="max-h-[90vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
      <MobileFooterNav />
    </div>
  );
}
