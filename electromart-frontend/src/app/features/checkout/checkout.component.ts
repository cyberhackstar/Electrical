import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AddressService } from '../../core/services/address.service';
import { AddressResponse } from '../../core/models/address.model';
import { CartService } from '../../core/services/cart.service';
import { CouponValidationResponse } from '../../core/models/coupon.model';
import { CouponService } from '../../core/services/coupon.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { RazorpayLoaderService } from '../../core/services/razorpay-loader.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';

type PaymentChoice = 'RAZORPAY' | 'COD';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);
  private couponService = inject(CouponService);
  private orderService = inject(OrderService);
  private razorpayLoader = inject(RazorpayLoaderService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  cartService = inject(CartService);
  authService = inject(AuthService);

  addresses = signal<AddressResponse[]>([]);
  selectedAddressId = signal<number | null>(null);
  showAddressForm = signal(false);
  loadingAddresses = signal(true);

  couponCode = '';
  appliedCoupon = signal<CouponValidationResponse | null>(null);
  couponError = signal<string | null>(null);
  applyingCoupon = signal(false);

  paymentMethod = signal<PaymentChoice>('RAZORPAY');
  placingOrder = signal(false);

  addressForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    addressType: ['HOME' as const, Validators.required],
    isDefault: [false],
  });

  get itemsTotal(): number {
    return this.cartService.subtotal();
  }

  get discountAmount(): number {
    return this.appliedCoupon()?.discountAmount ?? 0;
  }

  get afterDiscount(): number {
    return this.itemsTotal - this.discountAmount;
  }

  get shippingCharge(): number {
    return this.afterDiscount >= 999 ? 0 : 49;
  }

  get taxAmount(): number {
    return Math.round(this.afterDiscount * 0.18 * 100) / 100;
  }

  get orderTotal(): number {
    return Math.round((this.afterDiscount + this.shippingCharge + this.taxAmount) * 100) / 100;
  }

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Checkout',
      description: 'Complete your ElectroMart purchase securely.',
      noIndex: true,
    });

    this.cartService.refreshCart().subscribe((res) => {
      if (!res.data.items.length) {
        this.toast.info('Your cart is empty.');
        this.router.navigate(['/cart']);
      }
    });

    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.addressService.getMyAddresses().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        const defaultAddr = res.data.find((a) => a.isDefault) ?? res.data[0];
        if (defaultAddr) this.selectedAddressId.set(defaultAddr.id);
        this.showAddressForm.set(res.data.length === 0);
        this.loadingAddresses.set(false);
      },
      error: () => this.loadingAddresses.set(false),
    });
  }

  saveNewAddress(): void {
    // Strip leading zero or country code if user typed '07742261033' -> '7742261033'
    let rawPhone = this.addressForm.controls.phone.value.trim().replace(/^0/, '');
    this.addressForm.controls.phone.setValue(rawPhone);

    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toast.error('Please fix the highlighted errors in the form.');
      return;
    }

    const formVal = {
      ...this.addressForm.getRawValue(),
      country: 'India',
    };

    this.addressService.add(formVal).subscribe({
      next: (res) => {
        this.addresses.update((list) => [...list, res.data]);
        this.selectedAddressId.set(res.data.id);
        this.showAddressForm.set(false);
        this.addressForm.reset({ addressType: 'HOME', isDefault: false });
        this.toast.success('Address saved successfully');
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Failed to save address');
      },
    });
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;

    this.applyingCoupon.set(true);
    this.couponError.set(null);

    this.couponService.validate(this.couponCode.trim()).subscribe({
      next: (res) => {
        this.appliedCoupon.set(res.data);
        this.applyingCoupon.set(false);
        this.toast.success(`Coupon applied — you save ₹${res.data.discountAmount}`);
      },
      error: (err) => {
        this.applyingCoupon.set(false);
        this.couponError.set(err.error?.message ?? 'Invalid coupon code');
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode = '';
    this.couponError.set(null);
  }

  placeOrder(): void {
    const addressId = this.selectedAddressId();
    if (!addressId) {
      this.toast.error('Please select or add a delivery address.');
      return;
    }

    const request = {
      addressId,
      couponCode: this.appliedCoupon()?.code,
    };

    this.placingOrder.set(true);

    if (this.paymentMethod() === 'COD') {
      this.orderService.placeCodOrder(request).subscribe({
        next: (res) => {
          this.placingOrder.set(false);
          this.cartService.refreshCart().subscribe();
          this.router.navigate(['/order-confirmation', res.data.id]);
        },
        error: () => this.placingOrder.set(false),
      });
      return;
    }

    // Razorpay flow
    this.orderService.initiateRazorpayCheckout(request).subscribe({
      next: async (res) => {
        try {
          await this.razorpayLoader.load();
        } catch {
          this.toast.error('Could not load payment gateway. Check your connection and try again.');
          this.placingOrder.set(false);
          return;
        }

        const options = {
          key: res.data.razorpayKeyId,
          amount: res.data.amountInPaise,
          currency: res.data.currency,
          name: environment.siteName,
          description: `Order ${res.data.orderNumber}`,
          order_id: res.data.razorpayOrderId,
          handler: (response: any) => {
            this.orderService
              .verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              .subscribe({
                next: (verifyRes) => {
                  this.placingOrder.set(false);
                  this.cartService.refreshCart().subscribe();
                  this.router.navigate(['/order-confirmation', verifyRes.data.id]);
                },
                error: () => {
                  this.placingOrder.set(false);
                  this.toast.error(
                    'Payment verification failed. If money was deducted, contact support.',
                  );
                },
              });
          },
          modal: {
            ondismiss: () => {
              this.placingOrder.set(false);
              this.toast.info('Payment cancelled.');
            },
          },
          theme: { color: '#C9752E' },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      },
      error: () => this.placingOrder.set(false),
    });
  }
}
