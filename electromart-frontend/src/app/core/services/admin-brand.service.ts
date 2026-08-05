import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BrandResponse } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class AdminBrandService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/brands`;

  getAll(): Observable<ApiResponse<BrandResponse[]>> {
    return this.http.get<ApiResponse<BrandResponse[]>>(this.baseUrl);
  }

  create(name: string, logo: File | null): Observable<ApiResponse<BrandResponse>> {
    const formData = new FormData();
    formData.append('brand', new Blob([JSON.stringify({ name })], { type: 'application/json' }));
    if (logo) formData.append('logo', logo);
    return this.http.post<ApiResponse<BrandResponse>>(this.baseUrl, formData);
  }

  update(id: number, name: string, logo: File | null): Observable<ApiResponse<BrandResponse>> {
    const formData = new FormData();
    formData.append('brand', new Blob([JSON.stringify({ name })], { type: 'application/json' }));
    if (logo) formData.append('logo', logo);
    return this.http.put<ApiResponse<BrandResponse>>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
