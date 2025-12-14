"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation, listMessages, sendMessage, Message } from "@/lib/api/conversations";
import { useAuth } from "@/context/AuthContext";

type Props = {
  itemId: number;
  sellerUid?: string;
  currentUid?: string;
  initialConversationId?: number | null;
};

export function ChatBox({ itemId, sellerUid, currentUid, initialConversationId = null }: Props) {
  const [conversationId, setConversationId] = useState<number | null>(initialConversationId);
  const [body, setBody] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => listMessages(conversationId as number),
    enabled: conversationId !== null,
  });

  const createMutation = useMutation({
    mutationFn: () => createConversation(itemId),
    onSuccess: (res) => {
      setConversationId(res.conversationId);
    },
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      sendMessage(
        conversationId as number,
        body,
        user?.displayName ?? "",
        user?.photoURL ?? undefined
      ),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  useEffect(() => {
    if (sellerUid && currentUid && sellerUid === currentUid) {
      return;
    }
    if (initialConversationId) {
      setConversationId(initialConversationId);
      return;
    }
    // auto fetch existing conversation on first render by trying create (idempotent)
    createMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, initialConversationId, sellerUid, currentUid]);

  const messages: Message[] = messagesQuery.data ?? [];

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">出品者にDM</h3>
        {createMutation.isPending && <span className="text-xs text-slate-500">接続中...</span>}
      </div>
      {sellerUid && currentUid && sellerUid === currentUid && (
        <p className="mt-2 text-sm text-slate-500">自分の商品にはDMできません。</p>
      )}
      {createMutation.isError && (
        <p className="mt-2 text-sm text-red-600">チャットの開始に失敗しました。再度お試しください。</p>
      )}
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
        {messages.length === 0 && <p className="text-xs text-slate-500">まだメッセージはありません。</p>}
        {messages.map((m) => (
          <div key={m.id} className="flex gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
              {m.senderIconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.senderIconUrl} alt={m.senderName || m.senderUid} className="h-full w-full object-cover" />
              ) : (
                (m.senderName || m.senderUid || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-slate-700">
                {m.senderName || m.senderUid}{" "}
                <span className="font-normal text-slate-500">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-slate-800">{m.body}</p>
            </div>
          </div>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!conversationId || !body.trim()) return;
          sendMutation.mutate();
        }}
      >
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
          placeholder="メッセージを入力"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          disabled={!conversationId || sendMutation.isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          送信
        </button>
      </form>
    </div>
  );
}
