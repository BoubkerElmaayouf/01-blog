import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is logged in, redirect to explore page
  if (authService.isLoggedIn()) {
    router.navigate(['/explore']);
    return false;
  }

  return true;
}