export type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  status?: "listed" | "paused" | "in_transaction" | "sold" | string;
  imageUrl?: string | null;
  categorySlug?: string;
  sellerUid?: string;
  co2Kg?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemListResponse = {
  items: Item[];
  total: number;
};
