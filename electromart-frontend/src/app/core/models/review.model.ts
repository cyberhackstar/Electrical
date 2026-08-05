export interface ReviewResponse {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  comment: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
}
