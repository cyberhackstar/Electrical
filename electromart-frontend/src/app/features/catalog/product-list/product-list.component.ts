import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { SeoService } from '../../../core/services/seo.service';
import { BrandResponse } from '../../../core/models/brand.model';
import { CategoryResponse } from '../../../core/models/category.model';
import { ProductFilterParams, ProductResponse } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../../shared/components/skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private seoService = inject(SeoService);

  products = signal<ProductResponse[]>([]);
  categories = signal<CategoryResponse[]>([]);
  brands = signal<BrandResponse[]>([]);
  loading = signal(true);

  currentCategory = signal<CategoryResponse | null>(null);
  page = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  filtersOpen = signal(false);

  filters: ProductFilterParams = {
    page: 0,
    size: 12,
    sortBy: 'createdAt',
    sortDir: 'desc',
  };

  selectedBrandIds = new Set<number>();

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(res => this.categories.set(res.data));
    this.brandService.getAll().subscribe(res => this.brands.set(res.data));

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      const categorySlug = params.get('slug');
      const keyword = query.get('keyword');

      this.filters.keyword = keyword ?? undefined;
      this.filters.page = 0;

      if (categorySlug) {
        this.categoryService.getBySlug(categorySlug).subscribe(res => {
          this.currentCategory.set(res.data);
          this.filters.categoryId = res.data.id;
          this.loadProducts();
          this.updateSeo();
        });
      } else {
        this.currentCategory.set(null);
        this.filters.categoryId = undefined;
        this.loadProducts();
        this.updateSeo();
      }
    });
  }

  private updateSeo(): void {
    const category = this.currentCategory();
    const title = category ? category.name : (this.filters.keyword ? `Search: ${this.filters.keyword}` : 'All Products');
    this.seoService.updateMetaTags({
      title,
      description: category?.description ?? `Shop ${title.toLowerCase()} online at ElectroMart — genuine products, fast dispatch, secure checkout.`,
      url: category ? `/category/${category.slug}` : '/products',
    });
    if (category) {
      this.seoService.setJsonLd(
        this.seoService.buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: category.name, url: `/category/${category.slug}` },
        ]),
      );
    }
  }

  loadProducts(): void {
    this.loading.set(true);
    const brandIds = Array.from(this.selectedBrandIds);
    const activeFilters: ProductFilterParams = {
      ...this.filters,
      brandId: brandIds.length === 1 ? brandIds[0] : undefined, // backend supports single brandId; multi-brand handled client-side below if needed
    };

    this.productService.filterProducts(activeFilters).subscribe({
      next: res => {
        let content = res.data.content;
        if (brandIds.length > 1) {
          content = content.filter(p => p.brandId !== null && brandIds.includes(p.brandId));
        }
        this.products.set(content);
        this.page.set(res.data.page);
        this.totalPages.set(res.data.totalPages);
        this.totalElements.set(res.data.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSortChange(value: string): void {
    const [sortBy, sortDir] = value.split(':');
    this.filters.sortBy = sortBy;
    this.filters.sortDir = sortDir as 'asc' | 'desc';
    this.filters.page = 0;
    this.loadProducts();
  }

  toggleBrand(brandId: number): void {
    if (this.selectedBrandIds.has(brandId)) {
      this.selectedBrandIds.delete(brandId);
    } else {
      this.selectedBrandIds.add(brandId);
    }
    this.filters.page = 0;
    this.loadProducts();
  }

  applyPriceFilter(min: string, max: string): void {
    this.filters.minPrice = min ? Number(min) : undefined;
    this.filters.maxPrice = max ? Number(max) : undefined;
    this.filters.page = 0;
    this.loadProducts();
  }

  toggleInStockOnly(value: boolean): void {
    this.filters.inStockOnly = value;
    this.filters.page = 0;
    this.loadProducts();
  }

  goToPage(newPage: number): void {
    if (newPage < 0 || newPage >= this.totalPages()) return;
    this.filters.page = newPage;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.selectedBrandIds.clear();
    this.filters = {
      ...this.filters,
      brandId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: undefined,
      page: 0,
    };
    this.loadProducts();
  }
}
