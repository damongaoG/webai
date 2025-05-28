import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const modal = inject(NzModalService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Check if user is already on login page
        const currentUrl = router.url;
        const isLoginPage = currentUrl === "/auth/login";

        if (!isLoginPage) {
          window.location.href = "/auth/login";
        }
      } else if (error.status === 500) {
        router.navigate(["/server-error"]);
      }
      return throwError(() => error);
    }),
  );
};
