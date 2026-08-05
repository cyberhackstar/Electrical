import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NameplateSpec } from '../../../shared/components/nameplate/nameplate.component';
import { NameplateComponent } from '../../../shared/components/nameplate/nameplate.component';
import { ProductResponse } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { QuestionResponse } from '../../../core/models/question.model';
import { QuestionService } from '../../../core/services/question.service';
import { ReviewResponse } from '../../../core/models/review.model';
import { ReviewService } from '../../../core/services/review.service';
import { SeoService } from '../../../core/services/seo.service';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ToastService } from '../../../core/services/toast.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StarRatingComponent, NameplateComponent],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private questionService = inject(QuestionService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private authService = inject(AuthService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  product = signal<ProductResponse | null>(null);
  reviews = signal<ReviewResponse[]>([]);
  questions = signal<QuestionResponse[]>([]);
  loading = signal(true);
  activeImageIndex = signal(0);
  quantity = signal(1);
  addingToCart = signal(false);

  reviewForm = { rating: 5, comment: '' };
  submittingReview = signal(false);

  newQuestionText = '';
  submittingQuestion = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) this.loadProduct(slug);
    });
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.productService.getBySlug(slug).subscribe({
      next: res => {
        this.product.set(res.data);
        this.activeImageIndex.set(0);
        this.quantity.set(1);
        this.loading.set(false);
        this.loadReviews(res.data.id);
        this.loadQuestions(res.data.id);
        this.updateSeo(res.data);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getForProduct(productId).subscribe(res => this.reviews.set(res.data));
  }

  private loadQuestions(productId: number): void {
    this.questionService.getForProduct(productId).subscribe(res => this.questions.set(res.data));
  }

  askQuestion(): void {
    const p = this.product();
    if (!p || !this.newQuestionText.trim()) return;

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to ask a question.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submittingQuestion.set(true);
    this.questionService.ask({ productId: p.id, questionText: this.newQuestionText.trim() }).subscribe({
      next: () => {
        this.toast.success('Question submitted — we\'ll answer it soon.');
        this.newQuestionText = '';
        this.submittingQuestion.set(false);
        this.loadQuestions(p.id);
      },
      error: () => this.submittingQuestion.set(false),
    });
  }

  private updateSeo(product: ProductResponse): void {
    const image = this.primaryImage(product);
    this.seoService.updateMetaTags({
      title: product.name,
      description: product.description.slice(0, 160),
      image,
      url: `/product/${product.slug}`,
      type: 'product',
      keywords: `${product.name}, ${product.brandName ?? ''}, ${product.categoryName}`,
    });
    this.seoService.setJsonLd(
      this.seoService.buildProductSchema({
        name: product.name,
        description: product.description,
        sku: product.sku,
        image,
        price: product.effectivePrice,
        inStock: product.inStock,
        avgRating: product.avgRating,
        ratingCount: product.ratingCount,
        brandName: product.brandName,
      }),
      'jsonld-product',
    );
    this.seoService.setJsonLd(
      this.seoService.buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: product.categoryName, url: `/category/${product.slug}` },
        { name: product.name, url: `/product/${product.slug}` },
      ]),
      'jsonld-breadcrumb',
    );
  }

  primaryImage(product: ProductResponse): string {
    return product.images[0]?.imageUrl ?? 'https://placehold.co/600x600/F3F5F7/5B6672?text=No+Image';
  }

  get nameplateSpecs(): NameplateSpec[] {
    const p = this.product();
    if (!p) return [];
    const entries = Object.entries(p.attributes).map(([label, value]) => ({ label, value }));
    if (p.warranty) entries.push({ label: 'Warranty', value: p.warranty });
    entries.push({ label: 'SKU', value: p.sku });
    return entries;
  }

  get discountPercent(): number | null {
    const p = this.product();
    if (!p?.discountPrice || p.discountPrice >= p.price) return null;
    return Math.round(((p.price - p.discountPrice) / p.price) * 100);
  }

  get isWishlisted(): boolean {
    const p = this.product();
    return p ? this.wishlistService.wishlistProductIds().has(p.id) : false;
  }

  changeQuantity(delta: number): void {
    const p = this.product();
    if (!p) return;
    const next = this.quantity() + delta;
    if (next >= 1 && next <= p.stockQuantity) this.quantity.set(next);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to add items to your cart.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.addingToCart.set(true);
    this.cartService.addItem({ productId: p.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.toast.success(`${p.name} added to cart`);
        this.addingToCart.set(false);
      },
      error: () => this.addingToCart.set(false),
    });
  }

  buyNow(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to continue.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addItem({ productId: p.id, quantity: this.quantity() }).subscribe(() => {
      this.router.navigate(['/checkout']);
    });
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to save items to your wishlist.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.isWishlisted) {
      this.wishlistService.remove(p.id).subscribe(() => this.toast.success('Removed from wishlist'));
    } else {
      this.wishlistService.add(p.id).subscribe(() => this.toast.success('Added to wishlist'));
    }
  }

  submitReview(): void {
    const p = this.product();
    if (!p) return;

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Please log in to write a review.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submittingReview.set(true);
    this.reviewService.submit({ productId: p.id, rating: this.reviewForm.rating, comment: this.reviewForm.comment }).subscribe({
      next: () => {
        this.toast.success('Review submitted — thank you!');
        this.reviewForm = { rating: 5, comment: '' };
        this.submittingReview.set(false);
        this.loadReviews(p.id);
      },
      error: () => this.submittingReview.set(false),
    });
  }
}
