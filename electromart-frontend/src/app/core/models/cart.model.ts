export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  productSlug: string;
  price: number;
  quantity: number;
  subtotal: number;
  inStock: boolean;
  availableStock: number;
}

export interface CartResponse {
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
}

export interface CartItemRequest {
  productId: number;
  quantity: number;
}
