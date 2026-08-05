import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminOrderService } from '../../../core/services/admin-order.service';
import { OrderResponse, OrderStatus } from '../../../core/models/order.model';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(AdminOrderService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  orders = signal<OrderResponse[]>([]);
  loading = signal(true);
  page = signal(0);
  totalPages = signal(0);
  updatingId = signal<number | null>(null);

  readonly allStatuses: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Manage Orders', description: 'Admin order management.', noIndex: true });
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.orderService.getAll(this.page(), 20).subscribe({
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

  updateStatus(orderId: number, status: string): void {
    this.updatingId.set(orderId);
    this.orderService.updateStatus(orderId, status as OrderStatus).subscribe({
      next: res => {
        this.orders.update(list => list.map(o => (o.id === orderId ? res.data : o)));
        this.updatingId.set(null);
        this.toast.success('Order status updated');
      },
      error: () => this.updatingId.set(null),
    });
  }
}
