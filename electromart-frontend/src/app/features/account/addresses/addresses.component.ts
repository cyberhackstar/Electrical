import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddressResponse, AddressType } from '../../../core/models/address.model';
import { AddressService } from '../../../core/services/address.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
})
export class AddressesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  addresses = signal<AddressResponse[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    addressType: ['HOME' as AddressType, Validators.required],
    isDefault: [false],
  });

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'My Addresses',
      description: 'Manage your saved delivery addresses.',
      noIndex: true,
    });
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading.set(true);
    this.addressService.getMyAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddForm(): void {
    this.editingId.set(null);
    this.form.reset({ addressType: 'HOME', isDefault: false });
    this.showForm.set(true);
  }

  openEditForm(addr: AddressResponse): void {
    this.editingId.set(addr.id);
    this.form.setValue({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const editingId = this.editingId();

    const request$ = editingId
      ? this.addressService.update(editingId, value)
      : this.addressService.add(value);

    request$.subscribe(() => {
      this.toast.success(editingId ? 'Address updated' : 'Address added');
      this.showForm.set(false);
      this.loadAddresses();
    });
  }

  deleteAddress(id: number): void {
    this.addressService.delete(id).subscribe(() => {
      this.toast.success('Address deleted');
      this.loadAddresses();
    });
  }
}
