import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export interface SeoConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  keywords?: string;
  noIndex?: boolean;
}

/**
 * Centralizes every page's <title>, meta description, Open Graph / Twitter Card tags,
 * canonical URL, and JSON-LD structured data. Works identically during SSR and in-browser
 * because it only ever touches Angular's Title/Meta services and the DOM injection token —
 * never `document` directly outside of what Angular provides, so it's safe on the server.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  constructor(@Inject(DOCUMENT) private document: Document) {}

  updateMetaTags(config: SeoConfig): void {
    const fullTitle = `${config.title} | ${environment.siteName}`;
    const url = config.url ? `${environment.siteUrl}${config.url}` : environment.siteUrl;
    const image = config.image ?? `${environment.siteUrl}/assets/og-default.jpg`;

    this.titleService.setTitle(fullTitle);

    this.metaService.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.metaService.updateTag({ name: 'keywords', content: config.keywords });
    }
    this.metaService.updateTag({
      name: 'robots',
      content: config.noIndex ? 'noindex, nofollow' : 'index, follow',
    });

    // Open Graph
    this.metaService.updateTag({ property: 'og:title', content: fullTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:type', content: config.type ?? 'website' });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:site_name', content: environment.siteName });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: fullTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    this.setCanonicalUrl(url);
  }

  private setCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  /** Injects/updates a JSON-LD <script> block. Pass a unique id if the page has multiple schemas. */
  setJsonLd(schema: object, id = 'jsonld-main'): void {
    let script = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      this.document.head.appendChild(script);
    }
    script.text = JSON.stringify(schema);
  }

  removeJsonLd(id = 'jsonld-main'): void {
    const script = this.document.getElementById(id);
    if (script) script.remove();
  }

  /** Convenience builder for a Product JSON-LD schema — pass straight from ProductResponse. */
  buildProductSchema(product: {
    name: string;
    description: string;
    sku: string;
    image: string;
    price: number;
    inStock: boolean;
    avgRating: number;
    ratingCount: number;
    brandName?: string | null;
  }): object {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
      image: product.image,
      brand: product.brandName ? { '@type': 'Brand', name: product.brandName } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.price,
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
      ...(product.ratingCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.avgRating,
          reviewCount: product.ratingCount,
        },
      }),
    };
  }

  buildBreadcrumbSchema(items: { name: string; url: string }[]): object {
    return {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${environment.siteUrl}${item.url}`,
      })),
    };
  }
}
