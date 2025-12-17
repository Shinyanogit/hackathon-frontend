export type Notification = {
  id: number;
  type: string;
  title: string;
  body: string;
  itemId?: number;
  conversationId?: number;
  purchaseId?: number;
  read: boolean;
  createdAt: string;
};
