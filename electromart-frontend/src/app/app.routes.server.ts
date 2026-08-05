// import { RenderMode, ServerRoute } from '@angular/ssr';

// export const serverRoutes: ServerRoute[] = [
//   {
//     path: '**',
//     renderMode: RenderMode.Prerender
//   }
// ];

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Explicitly set dynamic routes with parameters to Client-side rendering
  {
    path: 'category/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'product/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'order-confirmation/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'account/orders/:id',
    renderMode: RenderMode.Client,
  },
  // Catch-all fallback for static pages
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
