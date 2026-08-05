import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserRole,
} from '../models/user.model';
import { CartService } from './cart.service';
import { TokenStorageService } from './token-storage.service';

export interface CurrentUser {
  userId: number;
  fullName: string;
  email: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private cartService = inject(CartService);
  private baseUrl = `${environment.apiUrl}/auth`;

  // Signal-based auth state so the header/guards can react instantly without subscribing manually
  private currentUserSignal = signal<CurrentUser | null>(this.tokenStorage.getUser<CurrentUser>());

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => {
    const role = this.currentUserSignal()?.role;
    return role === 'ROLE_ADMIN' || role === 'ROLE_STAFF';
  });

  register(request: RegisterRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/register`, request);
  }

  verifySignupOtp(request: OtpVerifyRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/verify-signup-otp`, request)
      .pipe(tap((res) => this.setSession(res.data)));
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/login`, request)
      .pipe(tap((res) => this.setSession(res.data)));
  }

  refreshToken(refreshToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.baseUrl}/refresh-token`, { refreshToken })
      .pipe(tap((res) => this.setSession(res.data)));
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/reset-password`, request);
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
    this.cartService.clearLocalState();
  }

  private setSession(auth: AuthResponse): void {
    this.tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    const user: CurrentUser = {
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
    };
    this.tokenStorage.setUser(user);
    this.currentUserSignal.set(user);
    this.cartService.refreshCart().subscribe();
  }
}
