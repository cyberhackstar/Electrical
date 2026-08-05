export interface WishlistResponse {
  wishlistItemId: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  price: number;
  inStock: boolean;
}
