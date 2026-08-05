import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NameplateComponent, NameplateSpec } from '../../shared/components/nameplate/nameplate.component';
import { SeoService } from '../../core/services/seo.service';
import { ProductService } from '../../core/services/product.service';
import { ProductResponse } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../shared/components/skeleton/product-card-skeleton.component';

interface CategoryTile {
  name: string;
  slug: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NameplateComponent, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private seoService = inject(SeoService);
  private productService = inject(ProductService);

  featuredProducts = signal<ProductResponse[]>([]);
  loadingFeatured = signal(true);

  readonly heroSpecs: NameplateSpec[] = [
    { label: 'Catalog', value: '100% Genuine' },
    { label: 'Dispatch', value: 'Within 24 Hrs' },
    { label: 'Coverage', value: 'Pan-India' },
    { label: 'Payment', value: 'Razorpay + COD' },
  ];

  readonly categories: CategoryTile[] = [
    { name: 'Wiring & Cables', slug: 'wiring-cables', description: 'Copper & PVC, all gauges' },
    { name: 'Switches & Sockets', slug: 'switches-sockets', description: 'Modular & industrial' },
    { name: 'MCBs & Breakers', slug: 'mcbs-breakers', description: 'ISI-marked protection' },
    { name: 'Lighting', slug: 'lighting', description: 'LED, panel, decorative' },
    { name: 'Fans', slug: 'fans', description: 'Ceiling, exhaust, wall' },
    { name: 'Tools', slug: 'tools', description: 'For every job on-site' },
  ];

  readonly trustPoints = [
    { title: 'Genuine Products', detail: 'Sourced from authorized distributors, every item warrantied.' },
    { title: 'Fast Dispatch', detail: 'Orders placed before 3 PM ship the same day.' },
    { title: 'Secure Checkout', detail: 'Razorpay-encrypted payments, plus Cash on Delivery.' },
    { title: 'Bulk Pricing', detail: 'Tiered rates for electricians and contractors — ask us.' },
  ];

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Genuine Electrical Supplies Online',
      description: 'Shop wiring, switches, MCBs, lighting, fans, and tools from authorized distributors. Fast dispatch, secure payments, Cash on Delivery available across India.',
      url: '/',
      keywords: 'electrical shop online, MCB, wiring, switches, LED lights, ceiling fans, electrical tools India',
    });

    this.productService.getFeatured().subscribe({
      next: res => {
        this.featuredProducts.set(res.data);
        this.loadingFeatured.set(false);
      },
      error: () => this.loadingFeatured.set(false),
    });
  }
}
