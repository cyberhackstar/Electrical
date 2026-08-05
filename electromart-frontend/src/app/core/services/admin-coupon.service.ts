import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CouponRequest, CouponResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class AdminCouponService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/coupons`;

  getAll(): Observable<ApiResponse<CouponResponse[]>> {
    return this.http.get<ApiResponse<CouponResponse[]>>(this.baseUrl);
  }

  create(request: CouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.http.post<ApiResponse<CouponResponse>>(this.baseUrl, request);
  }

  update(id: number, request: CouponRequest): Observable<ApiResponse<CouponResponse>> {
    return this.http.put<ApiResponse<CouponResponse>>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
