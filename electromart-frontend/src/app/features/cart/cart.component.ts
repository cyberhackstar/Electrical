import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  loading = signal(true);
  updatingItemId = signal<number | null>(null);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Your Cart',
      description: 'Review the items in your ElectroMart shopping cart.',
      noIndex: true,
    });

    if (!this.authService.isLoggedIn()) {
      this.loading.set(false);
      return;
    }

    this.cartService.refreshCart().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  updateQuantity(itemId: number, quantity: number): void {
    if (quantity < 1) return;
    this.updatingItemId.set(itemId);
    this.cartService.updateItemQuantity(itemId, quantity).subscribe({
      next: () => this.updatingItemId.set(null),
      error: () => this.updatingItemId.set(null),
    });
  }

  removeItem(itemId: number): void {
    this.updatingItemId.set(itemId);
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.toast.success('Item removed from cart');
        this.updatingItemId.set(null);
      },
      error: () => this.updatingItemId.set(null),
    });
  }

  goToCheckout(): void {
    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to continue to checkout.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
