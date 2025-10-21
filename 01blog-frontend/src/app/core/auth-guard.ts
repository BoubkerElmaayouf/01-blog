import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return authService.isValidToken().pipe(
    map(({ isValid, role, banned }) => {
      if (isValid && !banned) {
        // Save role for later
        localStorage.setItem('role', role || '');

        const path = route.routeConfig?.path;

        // Example: restrict access to admin route
        if (path === 'admin' && role !== 'ADMIN') {
          router.navigate(['/explore']);
          return false;
        }

        return true;
      } else {
        // User is either banned or token invalid
        authService.logout();
        if (banned) {
          alert('Your account has been banned. Contact support.');
        }
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
