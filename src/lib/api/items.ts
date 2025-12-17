import { apiClient } from "@/lib/apiClient";
import { Item, ItemListResponse } from "@/types/item";

export type ThreadMessage = {
  id: number;
  conversationId: number;
  senderUid: string;
  senderName: string;
  senderIconUrl?: string | null;
  parentMessageId?: number | null;
  depth: number;
  body: string;
  createdAt: string;
  children?: ThreadMessage[];
};

export type ThreadResponse = {
  conversationId: number | null;
  messages: ThreadMessage[];
};

export async function fetchItems(params?: { category?: string; query?: string; sellerUid?: string }) {
  const search = new URLSearchParams();
  if (params?.category) {
    search.set("category", params.category);
  }
  if (params?.query) {
    search.set("query", params.query);
  }
  if (params?.sellerUid) {
    search.set("sellerUid", params.sellerUid);
  }
  const qs = search.toString();
  const path = qs ? `/items?${qs}` : "/items";
  return apiClient.get<ItemListResponse>(path);
}

export async function fetchItem(id: number | string) {
  return apiClient.get<Item>(`/items/${id}`);
}

export async function fetchThread(itemId: number | string) {
  return apiClient.get<ThreadResponse>(`/items/${itemId}/thread`);
}

export async function createItem(payload: {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  categorySlug: string;
}) {
  return apiClient.post<Item>("/items", payload);
}

export async function updateItem(
  id: number | string,
  payload: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    categorySlug?: string;
  }
) {
  return apiClient.put<Item>(`/items/${id}`, payload);
}

export async function estimateItemCO2(id: number | string) {
  return apiClient.post<{ co2Kg: number | null }>(`/items/${id}/estimate-co2`);
}

export async function estimateItemCO2Preview(payload: {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}) {
  return apiClient.post<{ co2Kg: number | null; rid: string }>(`/items/estimate-co2-preview`, payload);
}

export async function fetchMyItems() {
  return apiClient.get<ItemListResponse>("/me/items");
}
