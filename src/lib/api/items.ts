import { apiClient } from "@/lib/apiClient";
import { Item, ItemListResponse } from "@/types/item";

export async function fetchItems(params?: { category?: string }) {
  const search = new URLSearchParams();
  if (params?.category) {
    search.set("category", params.category);
  }
  const qs = search.toString();
  const path = qs ? `/items?${qs}` : "/items";
  return apiClient.get<ItemListResponse>(path);
}

export async function fetchItem(id: number | string) {
  return apiClient.get<Item>(`/items/${id}`);
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
