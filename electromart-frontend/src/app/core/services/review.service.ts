import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ReviewRequest, ReviewResponse } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/reviews`;

  getForProduct(productId: number): Observable<ApiResponse<ReviewResponse[]>> {
    return this.http.get<ApiResponse<ReviewResponse[]>>(`${this.baseUrl}/product/${productId}`);
  }

  submit(request: ReviewRequest): Observable<ApiResponse<ReviewResponse>> {
    return this.http.post<ApiResponse<ReviewResponse>>(this.baseUrl, request);
  }

  delete(reviewId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${reviewId}`);
  }
}
