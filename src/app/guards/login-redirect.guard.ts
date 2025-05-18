import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is already authenticated, redirect to dashboard
  if (authService.isAuthenticated()) {
    authService.reLogIn().subscribe({
      next: (result) => {
        if (result.code === 1) {
          router.navigate(["/dashboard"]);
          return false;
        }
        // If not authenticated, access to auth pages
        return true;
      },
      error: () => {
        return true;
      },
    });

    // Prevent navigation until reLogin completes
    return false;
  }

  // Not authenticated
  return true;
};
