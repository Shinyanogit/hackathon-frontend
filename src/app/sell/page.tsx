"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createItem, estimateItemCO2, estimateItemCO2Preview } from "@/lib/api/items";
import { enhanceImage } from "@/lib/api/ai";
import { categories } from "@/constants/categories";
import { auth, storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const selectableCategories = categories.flatMap((c) => {
    const list: { label: string; value: string }[] = [];
    if (c.slug) list.push({ label: c.label, value: c.slug });
    if (c.children) {
      list.push(...c.children.map((child) => ({ label: `${c.label} / ${child.label}`, value: child.slug })));
    }
    return list;
  });
  const [categorySlug, setCategorySlug] = useState(selectableCategories[0]?.value ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [aiResult, setAiResult] = useState<{
    originalUrl: string;
    enhancedUrl: string;
    meta: { mode: string; strength: number; background: string; elapsedMs: number };
  } | null>(null);
  const [previewCo2, setPreviewCo2] = useState<number | null>(null);
  const [estimateNotice, setEstimateNotice] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<"original" | "ai">("original");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const estimateMutation = useMutation({
    mutationFn: (itemId: number) => estimateItemCO2(String(itemId)),
  });
  const previewMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !description.trim() || price === "") {
        throw new Error("タイトル・説明・価格を入力してください");
      }
      const img = aiResult
        ? selectedVersion === "ai"
          ? aiResult.enhancedUrl
          : aiResult.originalUrl
        : undefined;
      const res = await estimateItemCO2Preview({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        imageUrl: typeof img === "string" ? img : undefined,
      });
      return res.co2Kg;
    },
    onSuccess: (val) => {
      setPreviewCo2(val ?? null);
      setEstimateNotice(null);
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "CO2算出に失敗しました";
      setEstimateNotice(msg);
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !description.trim() || price === "") {
        throw new Error("タイトル・説明・価格は必須です");
      }
      const user = auth.currentUser;
      if (!user) {
        throw new Error("ログインが必要です");
      }

      let imageUrl = "https://picsum.photos/seed/item-placeholder/800/600";

      if (aiResult) {
        imageUrl = selectedVersion === "ai" ? aiResult.enhancedUrl : aiResult.originalUrl;
      } else if (selectedFile) {
        const storagePath = `items/${user.uid}/${Date.now()}-${selectedFile.name}`;
        const storageRef = ref(storage, storagePath);
        const snap = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        imageUrl,
        categorySlug,
      };
      return createItem(payload);
    },
    onSuccess: async (res) => {
      setError(null);
      setEstimateNotice(null);
      router.push(`/items/${res.id}`);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "出品に失敗しました";
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleFiles = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("画像ファイルは5MB以下にしてください");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageFileName(file.name);
      setSelectedFile(file);
      setAiResult(null);
      setSelectedVersion("original");
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFiles(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFiles(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const enhanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error("AI補正には画像ファイルを選択してください");
      }
      return enhanceImage({
        image: selectedFile,
        category: categorySlug,
        mode: "auto",
      });
    },
    onSuccess: (res) => {
      setAiResult(res);
      setSelectedVersion("ai");
      setError(null);
    },
    onError: (e: unknown) => {
      const message =
        e instanceof Error ? e.message : "AI背景クリーンアップに失敗しました。元画像のまま続行できます。";
      setError(message);
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">出品を始める</h1>
          <p className="text-sm text-slate-500">必要な情報を入力して商品を公開しましょう。</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
        >
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="title">
              商品名 <span className="text-emerald-600">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="例）クラシックデニムジャケット"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="description">
              説明 <span className="text-emerald-600">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              rows={4}
              placeholder="状態、サイズ、付属品などを詳しく書いてください"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="price">
              価格（円） <span className="text-emerald-600">*</span>
            </label>
            <input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              placeholder="例）4800"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800" htmlFor="category">
              カテゴリ <span className="text-emerald-600">*</span>
            </label>
            <select
              id="category"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
              required
            >
              {selectableCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">ジャンルを選択してください。API/DB に category_slug として保存されます。</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800" htmlFor="image-file">
              画像 <span className="text-xs font-normal text-slate-500">(任意・画像ファイル推奨)</span>
            </label>
            <div
              className={`flex flex-col gap-2 rounded-lg border border-dashed px-3 py-4 text-sm transition sm:flex-row sm:items-center ${
                isDragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                <input id="image-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span>画像ファイルを選択</span>
              </label>
              <div className="text-xs text-slate-500">またはここにドラッグ＆ドロップ</div>
              {imageFileName && <span className="text-xs text-slate-500">選択中: {imageFileName}</span>}
            </div>
            <p className="text-xs text-slate-500">
              5MB以下の画像ファイルに対応。選択しない場合はサンプル画像が自動で設定されます。
            </p>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-800">Listing Photo Enhancer</p>
                  <p className="text-xs text-slate-500">
                    AIで背景・光を補正しました（商品自体は変更しません）
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => enhanceMutation.mutate()}
                    disabled={enhanceMutation.isPending || mutation.isPending}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {enhanceMutation.isPending ? "AIで補正中..." : "AIで背景をきれいにする"}
                  </button>
                </div>
              </div>

              {aiResult && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                  <label className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
                    <input
                      type="radio"
                      name="preview-version"
                      value="ai"
                      checked={selectedVersion === "ai"}
                      onChange={() => setSelectedVersion("ai")}
                    />
                    AI版を使う
                  </label>
                  <label className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1">
                    <input
                      type="radio"
                      name="preview-version"
                      value="original"
                      checked={selectedVersion === "original"}
                      onChange={() => setSelectedVersion("original")}
                    />
                    元画像を使う
                  </label>
                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
                    {aiResult.meta.mode} / background {aiResult.meta.background}
                  </span>
                </div>
              )}

              {(imagePreview || aiResult) && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      aiResult
                        ? selectedVersion === "ai"
                          ? aiResult.enhancedUrl
                          : aiResult.originalUrl
                        : (imagePreview as string)
                    }
                    alt="Preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-900">推定CO2削減量</p>
                <p className="text-xs text-emerald-700">
                  出品前に推定値を確認できます。Geminiで算出し、出品時にも自動で保存されます。
                </p>
              </div>
              <button
                type="button"
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending || mutation.isPending}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {previewMutation.isPending ? "算出中..." : "CO2を算出する"}
              </button>
            </div>
            <div className="text-sm font-semibold text-emerald-900">
              {previewCo2 != null ? `推定: ${previewCo2.toFixed(1)} kgCO2e` : "未算出"}
            </div>
            {estimateNotice && <p className="text-xs text-emerald-800">{estimateNotice}</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {mutation.isPending ? "出品中..." : "出品する"}
          </button>
        </form>

        <div className="text-xs text-slate-500">
          このフォームから送信すると、API `/items` に対して出品データが登録されます。
        </div>
      </div>
    </main>
  );
}
