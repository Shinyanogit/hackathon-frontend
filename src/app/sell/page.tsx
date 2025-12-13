"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { createItem } from "@/lib/api/items";

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !description.trim() || price === "") {
        throw new Error("タイトル・説明・価格は必須です");
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        imageUrl: imageUrl.trim() || undefined,
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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">出品を始める</h1>
        <p className="text-sm text-slate-500">必要な情報を入力して商品を公開しましょう。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="title">
            商品名 <span className="text-emerald-600">*</span>
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
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
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
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
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
            placeholder="例）4800"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="imageUrl">
            画像URL
          </label>
          <input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-slate-500">画像URLがなくても出品できます（サンプル画像で表示されます）。</p>
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
    </main>
  );
}
