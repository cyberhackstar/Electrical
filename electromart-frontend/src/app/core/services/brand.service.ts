import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { BrandResponse } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/brands`;

  getAll(): Observable<ApiResponse<BrandResponse[]>> {
    return this.http.get<ApiResponse<BrandResponse[]>>(this.baseUrl);
  }
}
