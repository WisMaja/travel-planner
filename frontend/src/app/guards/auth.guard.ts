import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard chroniący trasy wymagające logowania
 * Jeśli użytkownik nie jest zalogowany, przekierowuje do strony logowania
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Przekieruj do logowania z informacją o żądanej trasie
  router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
  return false;
};

/**
 * Guard dla stron logowania/rejestracji
 * Jeśli użytkownik jest już zalogowany, przekierowuje do strony głównej
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Jeśli użytkownik jest zalogowany, przekieruj do home
    router.navigate(['/home']);
    return false;
  }

  return true;
};

