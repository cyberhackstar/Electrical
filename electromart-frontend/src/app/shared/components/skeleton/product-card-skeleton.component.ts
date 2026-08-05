import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    <div class="card overflow-hidden animate-pulse">
      <div class="aspect-square bg-steel/10"></div>
      <div class="p-4 space-y-2">
        <div class="h-3 bg-steel/10 rounded w-1/3"></div>
        <div class="h-4 bg-steel/10 rounded w-full"></div>
        <div class="h-4 bg-steel/10 rounded w-2/3"></div>
        <div class="h-8 bg-steel/10 rounded w-full mt-3"></div>
      </div>
    </div>
  `,
})
export class ProductCardSkeletonComponent {}
