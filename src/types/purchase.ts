export type PurchaseStatus = "pending_shipment" | "shipped" | "delivered" | "canceled";

export type Purchase = {
  id: number;
  itemId: number;
  buyerUid: string;
  sellerUid: string;
  conversationId: number;
  status: PurchaseStatus;
  shippingQrUrl: string;
  shippingNote: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseWithItem = {
  purchase: Purchase;
  item: import("./item").Item;
};
