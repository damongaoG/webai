import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

export const loginRedirectGuard: CanActivateFn = (
  route,
  state,
): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is not authenticated, allow access to auth pages
  if (!authService.isAuthenticated()) {
    return of(true);
  }

  return authService.reLogIn().pipe(
    map((result) => {
      if (result.code === 1) {
        router.navigate(["/dashboard"]);
        return false; // Prevent navigation to auth page
      }

      return true;
    }),
    catchError(() => {
      // On error, allow access to auth pages
      return of(true);
    }),
  );
};
