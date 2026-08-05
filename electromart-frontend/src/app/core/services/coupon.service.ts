import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CouponValidationResponse } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/coupons`;

  validate(code: string): Observable<ApiResponse<CouponValidationResponse>> {
    return this.http.get<ApiResponse<CouponValidationResponse>>(`${this.baseUrl}/validate`, { params: { code } });
  }
}
