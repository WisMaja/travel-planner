import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP dodający token autoryzacji do żądań
 * i automatycznie odświeżający token gdy wygaśnie (401 Unauthorized)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Pobierz token jeśli użytkownik jest zalogowany
  const token = authService.getAccessToken();

  // Dodaj token do nagłówka Authorization jeśli istnieje
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Obsłuż odpowiedź
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Jeśli otrzymaliśmy 401 Unauthorized, spróbuj odświeżyć token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        const refreshToken$ = authService.tryRefreshToken();
        
        if (refreshToken$) {
          return refreshToken$.pipe(
            switchMap((tokenResponse) => {
              // Zapisz nowe tokeny
              authService.saveTokens(tokenResponse.accessToken, tokenResponse.refreshToken);
              
              // Ponów oryginalne żądanie z nowym tokenem
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${tokenResponse.accessToken}`
                }
              });
              
              return next(newReq);
            }),
            catchError((refreshError) => {
              // Jeśli odświeżanie się nie udało, wyloguj użytkownika
              authService.logout();
              return throwError(() => refreshError);
            })
          );
        } else {
          // Nie ma refresh tokena, wyloguj użytkownika
          authService.logout();
        }
      }

      return throwError(() => error);
    })
  );
};

