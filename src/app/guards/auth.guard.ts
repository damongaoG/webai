import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "@/app/services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow direct access to these public routes
  const publicRoutes = ["/email", "/forget-password", "/privacy"];
  if (publicRoutes.some((route) => state.url.startsWith(route))) {
    return true;
  }

  if (authService.isAuthenticated()) {
    // Check if the user can access this route based on their role
    if (!authService.canAccessRoute(state.url)) {
      // Redirect to login page if access is not allowed
      router.navigate(["/auth/login"]);
      return false;
    }
    return true;
  }

  // Redirect unauthenticated users to login page
  router.navigate(["/auth/login"], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
