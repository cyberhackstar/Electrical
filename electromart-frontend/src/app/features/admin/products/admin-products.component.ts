import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminProductRequest, AdminProductService, BulkUploadResult, ProductAttributeInput } from '../../../core/services/admin-product.service';
import { BrandResponse } from '../../../core/models/brand.model';
import { BrandService } from '../../../core/services/brand.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductResponse } from '../../../core/models/product.model';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(AdminProductService);
  private categoryService = inject(CategoryService);
  private brandService = inject(BrandService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  products = signal<ProductResponse[]>([]);
  categories = signal<CategoryResponse[]>([]);
  brands = signal<BrandResponse[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);

  showForm = signal(false);
  editingProduct = signal<ProductResponse | null>(null);
  attributeRows = signal<ProductAttributeInput[]>([]);

  uploadingImage = signal(false);
  bulkUploading = signal(false);
  bulkResult = signal<BulkUploadResult | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    discountPrice: [0],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    warranty: [''],
    categoryId: [0, Validators.required],
    brandId: [0],
    featured: [false],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Manage Products', description: 'Admin product management.', noIndex: true });
    this.categoryService.getAll().subscribe(res => this.categories.set(res.data));
    this.brandService.getAll().subscribe(res => this.brands.set(res.data));
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAll(this.page(), 20).subscribe({
      next: res => {
        this.products.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadProducts();
  }

  openAddForm(): void {
    this.editingProduct.set(null);
    this.attributeRows.set([]);
    this.form.reset({ price: 0, discountPrice: 0, stockQuantity: 0, categoryId: 0, brandId: 0, featured: false });
    this.showForm.set(true);
  }

  openEditForm(product: ProductResponse): void {
    this.editingProduct.set(product);
    this.attributeRows.set(Object.entries(product.attributes).map(([attributeKey, attributeValue]) => ({ attributeKey, attributeValue })));
    this.form.setValue({
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice ?? 0,
      stockQuantity: product.stockQuantity,
      warranty: product.warranty ?? '',
      categoryId: product.categoryId,
      brandId: product.brandId ?? 0,
      featured: product.featured,
    });
    this.showForm.set(true);
  }

  addAttributeRow(): void {
    this.attributeRows.update(rows => [...rows, { attributeKey: '', attributeValue: '' }]);
  }

  removeAttributeRow(index: number): void {
    this.attributeRows.update(rows => rows.filter((_, i) => i !== index));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: AdminProductRequest = {
      name: value.name,
      sku: value.sku,
      description: value.description,
      price: value.price,
      discountPrice: value.discountPrice > 0 ? value.discountPrice : null,
      stockQuantity: value.stockQuantity,
      warranty: value.warranty || null,
      categoryId: value.categoryId,
      brandId: value.brandId > 0 ? value.brandId : null,
      featured: value.featured,
      attributes: this.attributeRows().filter(a => a.attributeKey.trim() && a.attributeValue.trim()),
    };

    const editing = this.editingProduct();
    const request$ = editing ? this.productService.update(editing.id, request) : this.productService.create(request);

    request$.subscribe({
      next: res => {
        this.toast.success(editing ? 'Product updated' : 'Product created');
        if (!editing) {
          // Keep the form open on the newly created product so images can be added right away
          this.editingProduct.set(res.data);
        } else {
          this.editingProduct.set(res.data);
        }
        this.loadProducts();
      },
    });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingProduct.set(null);
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe(() => {
      this.toast.success('Product deactivated');
      this.loadProducts();
    });
  }

  onImageSelected(event: Event, isPrimary: boolean): void {
    const editing = this.editingProduct();
    const input = event.target as HTMLInputElement;
    if (!editing || !input.files?.length) return;

    this.uploadingImage.set(true);
    this.productService.uploadImage(editing.id, input.files[0], isPrimary).subscribe({
      next: () => {
        this.uploadingImage.set(false);
        this.toast.success('Image uploaded');
        this.productService.getById(editing.id).subscribe(res => this.editingProduct.set(res.data));
      },
      error: () => this.uploadingImage.set(false),
    });
    input.value = '';
  }

  deleteImage(imageId: number): void {
    const editing = this.editingProduct();
    if (!editing) return;

    this.productService.deleteImage(imageId).subscribe(() => {
      this.toast.success('Image removed');
      this.productService.getById(editing.id).subscribe(res => this.editingProduct.set(res.data));
    });
  }

  onBulkUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.bulkUploading.set(true);
    this.bulkResult.set(null);

    this.productService.bulkUpload(input.files[0]).subscribe({
      next: res => {
        this.bulkResult.set(res.data);
        this.bulkUploading.set(false);
        this.loadProducts();
      },
      error: () => this.bulkUploading.set(false),
    });
    input.value = '';
  }
}
