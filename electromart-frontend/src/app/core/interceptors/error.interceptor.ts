import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { TokenStorageService } from '../services/token-storage.service';

let isNotifiedSessionExpired = false;

/**
 * Centralizes API error handling:
 * - Handles session expiration (401 / 403 when token exists) by clearing state and redirecting once.
 * - Suppresses duplicate permission toasts on initial app load.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tokenStorage = inject(TokenStorageService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage = error.error?.message as string | undefined;
      const hasToken = !!tokenStorage.getAccessToken();

      // If request failed with 401 OR 403 while sending a token, the session is expired
      if (error.status === 401 || (error.status === 403 && hasToken)) {
        authService.logout(); // Clears token storage & sets user signal/subject to null

        if (!isNotifiedSessionExpired) {
          isNotifiedSessionExpired = true;
          toast.error('Your session has expired. Please log in again.');
          setTimeout(() => (isNotifiedSessionExpired = false), 3000);
        }

        router.navigate(['/auth/login']);
      }
      // Pure 403 Permission Denied (e.g., a customer trying to access /admin routes)
      else if (error.status === 403) {
        toast.error(backendMessage ?? "You don't have permission to do that.");
      } else if (error.status === 0) {
        toast.error('Unable to reach the server. Check your connection and try again.');
      } else if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error('Something went wrong. Please try again.');
      }

      return throwError(() => error);
    }),
  );
};
