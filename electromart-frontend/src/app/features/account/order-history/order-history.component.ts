import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderResponse } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-history.component.html',
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private seoService = inject(SeoService);

  orders = signal<OrderResponse[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);

  readonly statusStyles: Record<string, string> = {
    PLACED: 'bg-steel/10 text-steel',
    CONFIRMED: 'bg-copper/10 text-copper',
    PACKED: 'bg-copper/10 text-copper',
    SHIPPED: 'bg-amber/10 text-amber-dark',
    DELIVERED: 'bg-teal/10 text-teal',
    CANCELLED: 'bg-red-100 text-red-600',
    RETURNED: 'bg-red-100 text-red-600',
  };

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'My Orders',
      description: 'View and track your ElectroMart orders.',
      noIndex: true,
    });
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getMyOrders(this.page(), 10).subscribe({
      next: res => {
        this.orders.set(res.data.content);
        this.totalPages.set(res.data.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages()) return;
    this.page.set(p);
    this.loadOrders();
  }
}
