import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CartItemRequest, CartResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/cart`;

  private cartSignal = signal<CartResponse | null>(null);

  readonly cart = computed(() => this.cartSignal());
  readonly itemCount = computed(() => this.cartSignal()?.totalItems ?? 0);
  readonly subtotal = computed(() => this.cartSignal()?.subtotal ?? 0);

  /** Call once after login (and on app init if already logged in) to hydrate the cart badge. */
  refreshCart(): Observable<ApiResponse<CartResponse>> {
    return this.http.get<ApiResponse<CartResponse>>(this.baseUrl)
      .pipe(tap(res => this.cartSignal.set(res.data)));
  }

  addItem(request: CartItemRequest): Observable<ApiResponse<CartResponse>> {
    return this.http.post<ApiResponse<CartResponse>>(`${this.baseUrl}/items`, request)
      .pipe(tap(res => this.cartSignal.set(res.data)));
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<ApiResponse<CartResponse>> {
    return this.http.put<ApiResponse<CartResponse>>(`${this.baseUrl}/items/${itemId}?quantity=${quantity}`, {})
      .pipe(tap(res => this.cartSignal.set(res.data)));
  }

  removeItem(itemId: number): Observable<ApiResponse<CartResponse>> {
    return this.http.delete<ApiResponse<CartResponse>>(`${this.baseUrl}/items/${itemId}`)
      .pipe(tap(res => this.cartSignal.set(res.data)));
  }

  clearLocalState(): void {
    this.cartSignal.set(null);
  }
}
