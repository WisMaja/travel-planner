import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserInfo {
  id: string;
  fullName: string | null;
  email: string | null;
  profileImageUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  register(data: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, data).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  refreshToken(accessToken: string, refreshToken: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/refresh`, {
      accessToken,
      refreshToken
    });
  }

  /**
   * Sprawdza czy użytkownik jest zalogowany (czy ma tokeny i czy token jest ważny)
   */
  isAuthenticated(): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) {
      return false;
    }

    // Sprawdź czy token nie wygasł
    return this.isTokenValid(token);
  }

  /**
   * Sprawdza czy token JWT jest ważny (nie wygasł)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) {
        return false;
      }

      // Sprawdź czy token nie wygasł (z małym marginesem 60 sekund)
      const expirationTime = payload.exp * 1000; // exp jest w sekundach
      const currentTime = Date.now();
      const margin = 60 * 1000; // 60 sekund marginesu

      return expirationTime > (currentTime + margin);
    } catch (error) {
      return false;
    }
  }

  /**
   * Dekoduje token JWT (bez weryfikacji podpisu)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  /**
   * Wylogowuje użytkownika i usuwa tokeny
   */
  logout(): void {
    this.tokenStorage.clearTokens();
    this.router.navigate(['/signin']);
  }

  /**
   * Zwraca access token jeśli użytkownik jest zalogowany
   */
  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return this.tokenStorage.getAccessToken();
    }
    return null;
  }

  /**
   * Zwraca refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  /**
   * Zapisuje tokeny po zalogowaniu
   */
  saveTokens(accessToken: string, refreshToken: string): void {
    this.tokenStorage.saveTokens(accessToken, refreshToken);
  }

  /**
   * Pobiera dane aktualnie zalogowanego użytkownika
   */
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${environment.apiUrl}/user/me`);
  }

  /**
   * Próbuje odświeżyć token używając refresh token
   * Zwraca Observable z nowymi tokenami lub null jeśli się nie udało
   */
  tryRefreshToken(): Observable<TokenResponse> | null {
    const accessToken = this.tokenStorage.getAccessToken();
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return null;
    }

    return this.refreshToken(accessToken, refreshToken).pipe(
      catchError((error) => {
        // Jeśli odświeżanie się nie udało, wyloguj użytkownika
        this.logout();
        return throwError(() => error);
      })
    );
  }
}
