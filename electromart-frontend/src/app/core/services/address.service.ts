import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AddressRequest, AddressResponse } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/addresses`;

  getMyAddresses(): Observable<ApiResponse<AddressResponse[]>> {
    return this.http.get<ApiResponse<AddressResponse[]>>(this.baseUrl);
  }

  add(request: AddressRequest): Observable<ApiResponse<AddressResponse>> {
    return this.http.post<ApiResponse<AddressResponse>>(this.baseUrl, request);
  }

  update(id: number, request: AddressRequest): Observable<ApiResponse<AddressResponse>> {
    return this.http.put<ApiResponse<AddressResponse>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
