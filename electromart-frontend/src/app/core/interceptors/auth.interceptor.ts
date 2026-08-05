// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { TokenStorageService } from '../services/token-storage.service';

// /** Attaches the JWT access token to every outgoing API request, if one exists. */
// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const tokenStorage = inject(TokenStorageService);
//   const token = tokenStorage.getAccessToken();

//   if (token) {
//     const cloned = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` },
//     });
//     return next(cloned);
//   }

//   return next(req);
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../services/token-storage.service';

/**
 * Adds the JWT access token to authenticated backend API requests.
 * Skips public assets, third-party URLs, and authentication endpoints.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);

  const accessToken = tokenStorage.getAccessToken();

  // Only attach token to your own backend API
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  // Skip authentication endpoints
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password') ||
    req.url.includes('/auth/verify-email') ||
    req.url.includes('/auth/refresh-token');

  // Skip requests that don't require JWT
  if (!isApiRequest || isAuthRequest || !accessToken) {
    return next(req);
  }

  // Clone request with Authorization header
  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(authenticatedRequest);
};
