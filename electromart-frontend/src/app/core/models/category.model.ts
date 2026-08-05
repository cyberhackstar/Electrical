export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  parentName: string | null;
  active: boolean;
  subCategories: CategoryResponse[];
}
