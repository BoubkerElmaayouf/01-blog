import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Step 1: if no token in localStorage → go to login
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Step 2: validate token on backend (now returns { isValid, role })
  return authService.isValidToken().pipe(
    map(({ isValid, role }) => {
      if (isValid) {
        // ✅ Token valid
        console.log('✅ Token valid, role:', role);

        // (Optional) Save role for later use
        localStorage.setItem('role', role || '');

        // 🔒 Optional: restrict access by role (example: admin route)
        const path = route.routeConfig?.path;
        if (path === 'admin' && role !== 'ADMIN') {
          router.navigate(['/explore']);
          return false;
        }

        return true;
      } else {
        // ❌ Token invalid or expired
        authService.logout();
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      // ❌ Any backend or network error
      authService.logout();
      router.navigate(['/login']);
      return of(false);
    })
  );
};
