"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMessage, listConversations, listMessages, sendMessage } from "@/lib/api/conversations";
import { fetchThread, ThreadMessage } from "@/lib/api/items";
import { fetchPublicUser } from "@/lib/api/users";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/apiClient";

type Props = {
  itemId: number;
  sellerUid?: string;
  currentUid?: string;
  initialConversationId?: number | null;
  purchaseConversationId?: number | null;
};

type PostMessageBody = {
  text: string;
  parentMessageId?: number | null;
  senderName?: string;
  senderIconUrl?: string;
};

export function ChatBox({ itemId, sellerUid, currentUid, initialConversationId, purchaseConversationId }: Props) {
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<ThreadMessage | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isSellerViewingOwnItem = sellerUid && currentUid && sellerUid === currentUid;
  const isAuthenticated = !!user;

  const { data: myConversations } = useQuery({
    queryKey: ["conversations", currentUid],
    queryFn: listConversations,
    enabled: Boolean(isSellerViewingOwnItem && isAuthenticated),
  });

  const threadQuery = useQuery({
    queryKey: ["thread", itemId],
    queryFn: () => fetchThread(itemId),
    enabled: !purchaseConversationId,
  });

  const purchaseMessagesQuery = useQuery({
    queryKey: ["messages", purchaseConversationId],
    queryFn: () => listMessages(purchaseConversationId as number),
    enabled: Boolean(purchaseConversationId && isAuthenticated),
  });

  const messages: ThreadMessage[] = useMemo(() => {
    if (purchaseConversationId) {
      return (
        purchaseMessagesQuery.data?.map((m) => ({
          id: m.id,
          conversationId: m.conversationId,
          senderUid: m.senderUid,
          senderName: m.senderName || m.senderUid,
          senderIconUrl: m.senderIconUrl,
          parentMessageId: null,
          depth: 0,
          body: m.body,
          createdAt: m.createdAt,
        })) ?? []
      );
    }
    return threadQuery.data?.messages ?? [];
  }, [purchaseConversationId, purchaseMessagesQuery.data, threadQuery.data?.messages]);

  const profileQueries = useQueries({
    queries: Array.from(new Set(messages.map((m) => m.senderUid))).map((uid) => ({
      queryKey: ["public-user", uid],
      queryFn: () => fetchPublicUser(uid),
      enabled: !!uid,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const profileMap = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof fetchPublicUser>>>();
    profileQueries.forEach((q) => {
      if (q.data?.uid) {
        map.set(q.data.uid, q.data);
      }
    });
    return map;
  }, [profileQueries]);

  const conversationId = useMemo(
    () =>
      purchaseConversationId ??
      threadQuery.data?.conversationId ??
      initialConversationId ??
      (isSellerViewingOwnItem
        ? myConversations?.find((c) => c.itemId === itemId)?.conversationId ?? null
        : null),
    [
      initialConversationId,
      isSellerViewingOwnItem,
      itemId,
      myConversations,
      purchaseConversationId,
      threadQuery.data?.conversationId,
    ]
  );

  const sendMutation = useMutation({
    mutationFn: (payload: PostMessageBody) => {
      if (purchaseConversationId && conversationId) {
        return sendMessage(conversationId, payload.text, payload.senderName, payload.senderIconUrl);
      }
      return apiClient.post(`/items/${itemId}/messages`, payload);
    },
    onSuccess: () => {
      setBody("");
      setReplyTo(null);
      if (purchaseConversationId && conversationId) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations", currentUid] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
        queryClient.invalidateQueries({ queryKey: ["conversations", currentUid] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: number) => deleteMessage(conversationId as number, messageId),
    onSuccess: () => {
      if (purchaseConversationId && conversationId) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["thread", itemId] });
      }
    },
  });

  const threadTree = useMemo(() => {
    const map = new Map<number, ThreadMessage>();
    messages.forEach((m) => map.set(m.id, { ...m, children: [] }));
    const roots: ThreadMessage[] = [];
    map.forEach((m) => {
      if (m.parentMessageId && map.has(m.parentMessageId)) {
        const parent = map.get(m.parentMessageId)!;
        parent.children = parent.children || [];
        parent.children.push(m);
      } else {
        roots.push(m);
      }
    });
    return roots;
  }, [messages]);

  const renderThread = (nodes: ThreadMessage[], level = 0) =>
    nodes.map((m) => {
      const profile = profileMap.get(m.senderUid);
      const name = profile?.displayName || m.senderName || m.senderUid;
      const icon =
        profile?.photoURL ||
        m.senderIconUrl ||
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60";
      const children = m.children ?? [];

      return (
      <div key={m.id} className="space-y-1 rounded-lg bg-white px-3 py-2 shadow-sm" style={{ marginLeft: level * 12 }}>
        <div className="flex items-start gap-2">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt={name} className="h-full w-full object-cover" />
            ) : (
              (name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-slate-700">
              {name}{" "}
              <span className="font-normal text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>
            </p>
            <p className="text-sm text-slate-800 whitespace-pre-line">{m.body}</p>
            {isAuthenticated && (
              <div className="mt-1 flex items-center gap-2">
                <button
                  onClick={() => setReplyTo(m)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  返信
                </button>
                {user?.uid === m.senderUid && (
                  <button
                    onClick={() => {
                      if (!conversationId) return;
                      deleteMutation.mutate(m.id);
                    }}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                    disabled={deleteMutation.isPending}
                  >
                    削除
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {children.length > 0 && <div className="space-y-2">{renderThread(children, level + 1)}</div>}
      </div>
    );
    });

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">出品者にDM</h3>
        {threadQuery.isLoading && <span className="text-xs text-slate-500">読み込み中...</span>}
      </div>
      {isSellerViewingOwnItem && (
        <p className="mt-2 text-sm text-slate-500">
          自分の商品にはDMできません。購入者から届いたスレッドにのみ返信できます。
        </p>
      )}
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500">
            {isSellerViewingOwnItem ? "購入者からのDMはまだありません。" : "まだメッセージはありません。"}
          </p>
        )}
        {renderThread(threadTree)}
      </div>
      {isAuthenticated && (!isSellerViewingOwnItem || conversationId) ? (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            const payload: PostMessageBody = { text: body.trim() };
            if (replyTo) payload.parentMessageId = replyTo.id;
            payload.senderName = user?.displayName || user?.uid || "";
            payload.senderIconUrl = user?.photoURL || undefined;
            sendMutation.mutate(payload);
          }}
        >
          <input
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
            placeholder={replyTo ? `返信先: ${replyTo.senderName || replyTo.senderUid}` : "メッセージを入力"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {replyTo && (
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              返信中: {replyTo.body.slice(0, 40)}
              <button
                type="button"
                className="text-emerald-700 hover:text-emerald-800"
                onClick={() => setReplyTo(null)}
              >
                返信をやめる
              </button>
            </div>
          )}
          {!isSellerViewingOwnItem && (
            <p className="text-[11px] text-slate-500">ルート投稿（商品への新規DM）ができます。</p>
          )}
          {isSellerViewingOwnItem && replyTo && (
            <p className="text-[11px] text-slate-500">返信のみ可能です（出品者の新規DMは禁止）。</p>
          )}
          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            送信
          </button>
        </form>
      ) : null}
    </div>
  );
}
