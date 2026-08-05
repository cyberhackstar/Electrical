import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // =========================
  // PRERENDER (Static Pages)
  // =========================

  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'faq',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'terms',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'shipping-policy',
    renderMode: RenderMode.Prerender,
  },

  // =========================
  // SSR (SEO Pages)
  // =========================

  {
    path: 'products',
    renderMode: RenderMode.Server,
  },
  {
    path: 'category/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'product/:slug',
    renderMode: RenderMode.Server,
  },

  // =========================
  // CLIENT ONLY
  // =========================

  {
    path: 'auth/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client,
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client,
  },
  {
    path: 'order-confirmation/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'wishlist',
    renderMode: RenderMode.Client,
  },
  {
    path: 'account/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },

  // =========================
  // FALLBACK
  // =========================

  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
