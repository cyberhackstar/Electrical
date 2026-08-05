import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { WishlistResponse } from '../models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/wishlist`;

  private wishlistSignal = signal<WishlistResponse[]>([]);
  readonly wishlist = computed(() => this.wishlistSignal());
  readonly wishlistProductIds = computed(() => new Set(this.wishlistSignal().map(w => w.productId)));

  refreshWishlist(): Observable<ApiResponse<WishlistResponse[]>> {
    return this.http.get<ApiResponse<WishlistResponse[]>>(this.baseUrl)
      .pipe(tap(res => this.wishlistSignal.set(res.data)));
  }

  add(productId: number): Observable<ApiResponse<WishlistResponse>> {
    return this.http.post<ApiResponse<WishlistResponse>>(`${this.baseUrl}/${productId}`, {})
      .pipe(tap(() => this.refreshWishlist().subscribe()));
  }

  remove(productId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${productId}`)
      .pipe(tap(() => this.wishlistSignal.update(list => list.filter(w => w.productId !== productId))));
  }

  clearLocalState(): void {
    this.wishlistSignal.set([]);
  }
}
