export type Item = {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemListResponse = {
  items: Item[];
  total: number;
};
