import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // 1. Static Public Pages: Prerender at build time for Instant Loading & 100 SEO Score
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },

  // 2. Dynamic Content (Products/Categories): SSR for Search Crawlers
  {
    path: 'category/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'product/:slug',
    renderMode: RenderMode.Server,
  },

  // 3. User Dashboard / Admin Routes: Skip SSR & execute purely on Client side
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'account/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client,
  },

  // Fallback for remaining routes
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
