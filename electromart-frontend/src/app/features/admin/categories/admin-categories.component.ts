import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCategoryService } from '../../../core/services/admin-category.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
})
export class AdminCategoriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(AdminCategoryService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  categories = signal<CategoryResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    parentId: [0],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Manage Categories', description: 'Admin category management.', noIndex: true });
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: res => {
        this.categories.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.selectedFile = null;
    this.form.reset({ parentId: 0 });
    this.showForm.set(true);
  }

  openEditForm(cat: CategoryResponse): void {
    this.editingId.set(cat.id);
    this.selectedFile = null;
    this.form.setValue({ name: cat.name, description: cat.description ?? '', parentId: cat.parentId ?? 0 });
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

    const value = this.form.getRawValue();
    const request = {
      name: value.name,
      description: value.description || undefined,
      parentId: value.parentId > 0 ? value.parentId : null,
    };

    const editingId = this.editingId();
    const request$ = editingId
      ? this.categoryService.update(editingId, request, this.selectedFile)
      : this.categoryService.create(request, this.selectedFile);

    request$.subscribe(() => {
      this.toast.success(editingId ? 'Category updated' : 'Category created');
      this.showForm.set(false);
      this.loadCategories();
    });
  }

  deleteCategory(id: number): void {
    this.categoryService.delete(id).subscribe(() => {
      this.toast.success('Category deactivated');
      this.loadCategories();
    });
  }
}
