import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderResponse } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-confirmation.component.html',
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private seoService = inject(SeoService);

  order = signal<OrderResponse | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      title: 'Order Confirmed',
      description: 'Your ElectroMart order has been placed successfully.',
      noIndex: true,
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.orderService.getOrderById(id).subscribe({
      next: res => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  downloadingInvoice = signal(false);

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
