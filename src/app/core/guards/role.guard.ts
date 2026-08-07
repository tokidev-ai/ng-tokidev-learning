import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Esperar a que Firebase inicialice el estado de autenticación
  await authService.isReady;

  if (!authService.isLoggedIn()) {
    // Save attempted URL or redirect to login
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data['roles'] as string[];
  const userRole = authService.currentRole();

  if (allowedRoles && userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // If user role is not allowed on this path, redirect to their home dashboard
  if (userRole === 'STUDENT') {
    router.navigate(['/student/dashboard']);
  } else if (userRole === 'INSTRUCTOR') {
    router.navigate(['/instructor']);
  } else if (userRole === 'ADMIN') {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/']);
  }

  return false;
};
