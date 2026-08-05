import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WishlistResponse } from '../../../core/models/wishlist.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'My Wishlist', description: 'Products you have saved for later.', noIndex: true });
    this.wishlistService.refreshWishlist().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  remove(productId: number): void {
    this.wishlistService.remove(productId).subscribe(() => this.toast.success('Removed from wishlist'));
  }

  addToCart(item: WishlistResponse): void {
    if (!item.inStock) return;
    this.cartService.addItem({ productId: item.productId, quantity: 1 }).subscribe(() => {
      this.toast.success(`${item.productName} added to cart`);
    });
  }
}
