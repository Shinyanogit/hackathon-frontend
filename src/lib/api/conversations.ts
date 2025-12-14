import { apiClient } from "@/lib/apiClient";
import { Item } from "@/types/item";

export type ConversationResponse = {
  conversationId: number;
  itemId: number;
  sellerUid: string;
  buyerUid: string;
  hasUnread?: boolean;
};

export type Message = {
  id: number;
  conversationId: number;
  senderUid: string;
  senderName?: string;
  senderIconUrl?: string | null;
  body: string;
  createdAt: string;
};

export async function createConversation(itemId: number | string) {
  return apiClient.post<ConversationResponse>(`/items/${itemId}/conversations`);
}

export async function listConversations() {
  return apiClient.get<ConversationResponse[]>("/conversations");
}

export async function getConversation(id: number | string) {
  return apiClient.get<ConversationResponse>(`/conversations/${id}`);
}

export async function markConversationRead(id: number | string) {
  return apiClient.post<{ status: string }>(`/conversations/${id}/read`);
}

export async function listMessages(conversationId: number | string) {
  return apiClient.get<Message[]>(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: number | string, body: string, senderName?: string, senderIconUrl?: string) {
  return apiClient.post<{ status: string }>(`/conversations/${conversationId}/messages`, {
    body,
    senderName,
    senderIconUrl,
  });
}
