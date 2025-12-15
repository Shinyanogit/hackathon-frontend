import { ApiError, apiClient } from "@/lib/apiClient";
import { Purchase, PurchaseWithItem } from "@/types/purchase";

export async function purchaseItem(itemId: number | string) {
  return apiClient.post<Purchase>(`/items/${itemId}/purchase`);
}

export async function fetchPurchase(itemId: number | string) {
  try {
    return await apiClient.get<Purchase>(`/items/${itemId}/purchase`);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
      return null;
    }
    throw err;
  }
}

export async function markShipped(purchaseId: number | string) {
  return apiClient.post<Purchase>(`/purchases/${purchaseId}/ship`);
}

export async function markDelivered(purchaseId: number | string) {
  return apiClient.post<Purchase>(`/purchases/${purchaseId}/receive`);
}

export async function cancelPurchase(purchaseId: number | string) {
  return apiClient.post<Purchase>(`/purchases/${purchaseId}/cancel`);
}

export async function fetchMyPurchases() {
  return apiClient.get<PurchaseWithItem[]>("/me/purchases");
}

export async function fetchMySales() {
  return apiClient.get<PurchaseWithItem[]>("/me/sales");
}
