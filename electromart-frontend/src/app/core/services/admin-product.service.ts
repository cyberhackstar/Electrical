import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResponse } from '../models/api-response.model';
import { ProductImageResponse, ProductResponse } from '../models/product.model';

export interface ProductAttributeInput {
  attributeKey: string;
  attributeValue: string;
}

export interface AdminProductRequest {
  name: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  warranty?: string | null;
  categoryId: number;
  brandId?: number | null;
  featured: boolean;
  attributes?: ProductAttributeInput[];
}

export interface BulkUploadResult {
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/products`;

  getAll(page = 0, size = 20): Observable<ApiResponse<PagedResponse<ProductResponse>>> {
    return this.http.get<ApiResponse<PagedResponse<ProductResponse>>>(this.baseUrl, { params: { page, size } });
  }

  getById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(`${this.baseUrl}/${id}`);
  }

  create(request: AdminProductRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(this.baseUrl, request);
  }

  update(id: number, request: AdminProductRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.put<ApiResponse<ProductResponse>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  uploadImage(productId: number, file: File, isPrimary: boolean): Observable<ApiResponse<ProductImageResponse>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ApiResponse<ProductImageResponse>>(
      `${this.baseUrl}/${productId}/images?isPrimary=${isPrimary}`,
      formData,
    );
  }

  deleteImage(imageId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/images/${imageId}`);
  }

  bulkUpload(file: File): Observable<ApiResponse<BulkUploadResult>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<BulkUploadResult>>(`${this.baseUrl}/bulk-upload`, formData);
  }
}
