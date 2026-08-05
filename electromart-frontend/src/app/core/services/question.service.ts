import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AnswerRequest, QuestionRequest, QuestionResponse } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/questions`;
  private adminUrl = `${environment.apiUrl}/admin/questions`;

  getForProduct(productId: number): Observable<ApiResponse<QuestionResponse[]>> {
    return this.http.get<ApiResponse<QuestionResponse[]>>(`${this.baseUrl}/product/${productId}`);
  }

  ask(request: QuestionRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.post<ApiResponse<QuestionResponse>>(this.baseUrl, request);
  }

  answer(questionId: number, request: AnswerRequest): Observable<ApiResponse<QuestionResponse>> {
    return this.http.put<ApiResponse<QuestionResponse>>(`${this.adminUrl}/${questionId}/answer`, request);
  }
}
