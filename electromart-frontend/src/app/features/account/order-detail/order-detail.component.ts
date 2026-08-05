import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderResponse } from '../../../core/models/order.model';
import { OrderService } from '../../../core/services/order.service';
import { SeoService } from '../../../core/services/seo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private seoService = inject(SeoService);
  private toast = inject(ToastService);

  order = signal<OrderResponse | null>(null);
  loading = signal(true);
  cancelling = signal(false);
  downloadingInvoice = signal(false);

  readonly cancellableStatuses = new Set(['PLACED', 'CONFIRMED']);

  readonly statusSteps: { key: string; label: string }[] = [
    { key: 'PLACED', label: 'Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  ngOnInit(): void {
    this.seoService.updateMetaTags({ title: 'Order Details', description: 'View your order details.', noIndex: true });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadOrder(id);
  }

  private loadOrder(id: number): void {
    this.loading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: res => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get currentStepIndex(): number {
    const order = this.order();
    if (!order) return -1;
    return this.statusSteps.findIndex(s => s.key === order.orderStatus);
  }

  get isCancelledOrReturned(): boolean {
    const status = this.order()?.orderStatus;
    return status === 'CANCELLED' || status === 'RETURNED';
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order) return;

    this.cancelling.set(true);
    this.orderService.cancelOrder(order.id).subscribe({
      next: res => {
        this.order.set(res.data);
        this.cancelling.set(false);
        this.toast.success('Order cancelled');
      },
      error: () => this.cancelling.set(false),
    });
  }

  downloadInvoice(): void {
    const order = this.order();
    if (!order) return;

    this.downloadingInvoice.set(true);
    this.orderService.downloadInvoice(order.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${order.orderNumber}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingInvoice.set(false);
      },
      error: () => this.downloadingInvoice.set(false),
    });
  }
}
