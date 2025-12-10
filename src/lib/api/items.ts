import { apiClient } from "@/lib/apiClient";
import { Item, ItemListResponse } from "@/types/item";

export async function fetchItems() {
  return apiClient.get<ItemListResponse>("/items");
}

export async function fetchItem(id: number | string) {
  return apiClient.get<Item>(`/items/${id}`);
}
