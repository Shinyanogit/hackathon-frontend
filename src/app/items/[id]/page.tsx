"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { ChatBox } from "@/components/item/ChatBox";
import { useAuth } from "@/context/AuthContext";
import { fetchItem } from "@/lib/api/items";

export default function ItemDetailPage() {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const conversationIdParam = searchParams.get("conversationId");
  const initialConversationId = conversationIdParam ? Number(conversationIdParam) : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      if (!id) throw new Error("missing id");
      return fetchItem(id as string);
    },
  });

  const fallbackImage =
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-neutral-500">Loading item...</p>
      </div>
    );
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white">
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
