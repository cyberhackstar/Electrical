import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductResponse } from '../../../core/models/product.model';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductResponse;

  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  addingToCart = false;

  get discountPercent(): number | null {
    if (!this.product.discountPrice || this.product.discountPrice >= this.product.price) return null;
    return Math.round(((this.product.price - this.product.discountPrice) / this.product.price) * 100);
  }

  get primaryImage(): string {
    return this.product.images.find(i => i.primary)?.imageUrl
      ?? this.product.images[0]?.imageUrl
      ?? 'https://placehold.co/400x400/F3F5F7/5B6672?text=No+Image';
  }

  get isWishlisted(): boolean {
    return this.wishlistService.wishlistProductIds().has(this.product.id);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to add items to your cart.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.product.inStock) return;

    this.addingToCart = true;
    this.cartService.addItem({ productId: this.product.id, quantity: 1 }).subscribe({
      next: () => {
        this.toast.success(`${this.product.name} added to cart`);
        this.addingToCart = false;
      },
      error: () => { this.addingToCart = false; },
    });
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to save items to your wishlist.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isWishlisted) {
      this.wishlistService.remove(this.product.id).subscribe(() => this.toast.success('Removed from wishlist'));
    } else {
      this.wishlistService.add(this.product.id).subscribe(() => this.toast.success('Added to wishlist'));
    }
  }
}
