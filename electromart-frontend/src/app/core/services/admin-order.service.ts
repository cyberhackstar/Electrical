import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { OrderResponse, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/orders`;

  getAll(page = 0, size = 20): Observable<ApiResponse<PagedResponse<OrderResponse>>> {
    return this.http.get<ApiResponse<PagedResponse<OrderResponse>>>(this.baseUrl, { params: { page, size } });
  }

  updateStatus(id: number, orderStatus: OrderStatus): Observable<ApiResponse<OrderResponse>> {
    return this.http.put<ApiResponse<OrderResponse>>(`${this.baseUrl}/${id}/status`, { orderStatus });
  }
}
