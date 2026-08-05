import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminBrandService } from '../../../core/services/admin-brand.service';
import { BrandResponse } from '../../../core/models/brand.model';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-brands.component.html',
})
export class AdminBrandsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandService = inject(AdminBrandService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  brands = signal<BrandResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Manage Brands', description: 'Admin brand management.', noIndex: true });
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading.set(true);
    this.brandService.getAll().subscribe({
      next: res => {
        this.brands.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.selectedFile = null;
    this.form.reset();
    this.showForm.set(true);
  }

  openEditForm(brand: BrandResponse): void {
    this.editingId.set(brand.id);
    this.selectedFile = null;
    this.form.setValue({ name: brand.name });
    this.showForm.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const name = this.form.getRawValue().name;
    const editingId = this.editingId();
    const request$ = editingId
      ? this.brandService.update(editingId, name, this.selectedFile)
      : this.brandService.create(name, this.selectedFile);

    request$.subscribe(() => {
      this.toast.success(editingId ? 'Brand updated' : 'Brand created');
      this.showForm.set(false);
      this.loadBrands();
    });
  }

  deleteBrand(id: number): void {
    this.brandService.delete(id).subscribe(() => {
      this.toast.success('Brand deactivated');
      this.loadBrands();
    });
  }
}
