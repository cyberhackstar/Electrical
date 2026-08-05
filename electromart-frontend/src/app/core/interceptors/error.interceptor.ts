import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { TokenStorageService } from '../services/token-storage.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Do not attempt refresh on auth endpoints (login, register, refresh-token)
      if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh-token')) {
        return throwError(() => error);
      }

      // Handle 401 Unauthorized (Expired Access Token)
      if (error.status === 401) {
        const refreshToken = tokenStorage.getRefreshToken();

        if (refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshTokenSubject.next(null);

            return authService.refreshToken(refreshToken).pipe(
              switchMap((response: any) => {
                isRefreshing = false;
                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                // Save tokens using setTokens
                tokenStorage.setTokens(newAccessToken, newRefreshToken);

                refreshTokenSubject.next(newAccessToken);

                // Re-send original failed request with the fresh token
                const clonedReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newAccessToken}` },
                });
                return next(clonedReq);
              }),
              catchError((refreshErr) => {
                isRefreshing = false;
                authService.logout();
                toast.error('Session expired. Please log in again.');
                router.navigate(['/auth/login']);
                return throwError(() => refreshErr);
              }),
            );
          } else {
            // Queue concurrent requests until the active token refresh finishes
            return refreshTokenSubject.pipe(
              filter((token) => token !== null),
              take(1),
              switchMap((newToken) => {
                const clonedReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                });
                return next(clonedReq);
              }),
            );
          }
        } else {
          authService.logout();
          router.navigate(['/auth/login']);
        }
      }

      return throwError(() => error);
    }),
  );
};
