import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CategoryResponse } from '../models/category.model';

export interface AdminCategoryRequest {
  name: string;
  description?: string;
  parentId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/categories`;

  getAll(): Observable<ApiResponse<CategoryResponse[]>> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(this.baseUrl);
  }

  create(request: AdminCategoryRequest, image: File | null): Observable<ApiResponse<CategoryResponse>> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.post<ApiResponse<CategoryResponse>>(this.baseUrl, formData);
  }

  update(id: number, request: AdminCategoryRequest, image: File | null): Observable<ApiResponse<CategoryResponse>> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<ApiResponse<CategoryResponse>>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
