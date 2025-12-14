"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createItem } from "@/lib/api/items";
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
  const [error, setError] = useState<string | null>(null);

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

      if (selectedFile) {
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
    onSuccess: (res) => {
      setError(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      setError(null);
    };
    reader.readAsDataURL(file);
  };

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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
                <input id="image-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <span>画像ファイルを選択</span>
              </label>
              {imageFileName && <span className="text-xs text-slate-500">{imageFileName}</span>}
            </div>
            <p className="text-xs text-slate-500">
              5MB以下の画像ファイルに対応。選択しない場合はサンプル画像が自動で設定されます。
            </p>
            {imagePreview && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover" />
              </div>
            )}
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
