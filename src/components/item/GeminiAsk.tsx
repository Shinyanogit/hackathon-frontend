"use client";

import { useState } from "react";
import { askItemWithGemini } from "@/lib/api/ai";
import { useAuth } from "@/context/AuthContext";

type Props = {
  itemId: number;
  item: {
    title: string;
    description: string;
    price: number;
    categorySlug?: string;
  };
};

export function GeminiAsk({ itemId, item }: Props) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (!question.trim() || !user) return;
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askItemWithGemini(itemId, question.trim());
      setAnswer(res.answer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "問い合わせに失敗しました";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AI Q&A</p>
          <h3 className="text-lg font-bold text-slate-900">商品について質問する</h3>
        </div>
        {!user && (
          <span className="text-[11px] font-semibold text-slate-500">
            ログインしてください
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600">
        商品データを元に AIが回答
      </p>
      <div className="mt-3 space-y-2">
        <textarea
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
          placeholder="例）素材やサイズ感は？実物の傷はありますか？"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={!user}
        />
        <button
          onClick={ask}
          disabled={isLoading || !user || !question.trim()}
          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isLoading ? "回答を生成中..." : "質問する"}
        </button>
      </div>
      {answer && (
        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-800 whitespace-pre-line">
          {answer}
        </div>
      )}
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
