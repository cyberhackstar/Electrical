import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import {
  CheckoutRequest,
  OrderResponse,
  PaymentVerificationRequest,
  RazorpayOrderResponse,
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private checkoutUrl = `${environment.apiUrl}/checkout`;
  private paymentsUrl = `${environment.apiUrl}/payments`;
  private ordersUrl = `${environment.apiUrl}/orders`;

  initiateRazorpayCheckout(request: CheckoutRequest): Observable<ApiResponse<RazorpayOrderResponse>> {
    return this.http.post<ApiResponse<RazorpayOrderResponse>>(`${this.checkoutUrl}/razorpay`, request);
  }

  placeCodOrder(request: CheckoutRequest): Observable<ApiResponse<OrderResponse>> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.checkoutUrl}/cod`, request);
  }

  verifyPayment(request: PaymentVerificationRequest): Observable<ApiResponse<OrderResponse>> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.paymentsUrl}/verify`, request);
  }

  getMyOrders(page = 0, size = 10): Observable<ApiResponse<PagedResponse<OrderResponse>>> {
    return this.http.get<ApiResponse<PagedResponse<OrderResponse>>>(`${this.ordersUrl}/my`, {
      params: { page, size },
    });
  }

  getOrderById(id: number): Observable<ApiResponse<OrderResponse>> {
    return this.http.get<ApiResponse<OrderResponse>>(`${this.ordersUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<ApiResponse<OrderResponse>> {
    return this.http.post<ApiResponse<OrderResponse>>(`${this.ordersUrl}/${id}/cancel`, {});
  }

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.ordersUrl}/${id}/invoice`, { responseType: 'blob' });
  }
}
