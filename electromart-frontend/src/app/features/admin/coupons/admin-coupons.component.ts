import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminCouponService } from '../../../core/services/admin-coupon.service';
import { CouponResponse, DiscountType } from '../../../core/models/coupon.model';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-coupons.component.html',
})
export class AdminCouponsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private couponService = inject(AdminCouponService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  coupons = signal<CouponResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    discountType: ['PERCENTAGE' as DiscountType, Validators.required],
    discountValue: [0, [Validators.required, Validators.min(0.01)]],
    minOrderValue: [0],
    maxDiscountAmount: [0],
    expiryDate: ['', Validators.required],
    usageLimit: [0],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Manage Coupons',
      description: 'Admin coupon management.',
      noIndex: true,
    });
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.loading.set(true);
    this.couponService.getAll().subscribe({
      next: (res) => {
        this.coupons.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.form.reset({
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
    });
    this.showForm.set(true);
  }

  openEditForm(coupon: CouponResponse): void {
    this.editingId.set(coupon.id);
    this.form.setValue({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue ?? 0,
      maxDiscountAmount: coupon.maxDiscountAmount ?? 0,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit ?? 0,
    });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request = {
      code: value.code,
      discountType: value.discountType,
      discountValue: value.discountValue,
      minOrderValue: value.minOrderValue > 0 ? value.minOrderValue : undefined,
      maxDiscountAmount: value.maxDiscountAmount > 0 ? value.maxDiscountAmount : undefined,
      expiryDate: value.expiryDate,
      usageLimit: value.usageLimit > 0 ? value.usageLimit : undefined,
    };

    const editingId = this.editingId();
    const request$ = editingId
      ? this.couponService.update(editingId, request)
      : this.couponService.create(request);

    request$.subscribe(() => {
      this.toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      this.showForm.set(false);
      this.loadCoupons();
    });
  }

  deactivate(id: number): void {
    this.couponService.deactivate(id).subscribe(() => {
      this.toast.success('Coupon deactivated');
      this.loadCoupons();
    });
  }
}
