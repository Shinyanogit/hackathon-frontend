import { apiClient } from "@/lib/api-client";
import { Item, ItemListResponse } from "@/types/item";

export async function fetchItems() {
  const res = await apiClient.get<ItemListResponse>("/items");
  return res.data;
}

export async function fetchItem(id: number | string) {
  const res = await apiClient.get<Item>(`/items/${id}`);
  return res.data;
}
