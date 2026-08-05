export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  displayOrder: number;
  primary: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  stockQuantity: number;
  inStock: boolean;
  warranty: string | null;
  categoryId: number;
  categoryName: string;
  brandId: number | null;
  brandName: string | null;
  avgRating: number;
  ratingCount: number;
  featured: boolean;
  active: boolean;
  images: ProductImageResponse[];
  attributes: Record<string, string>;
}

export interface ProductFilterParams {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  inStockOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
