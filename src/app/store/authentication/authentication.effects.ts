import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@/app/services/auth.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, map, of } from "rxjs";
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutSuccess,
} from "./authentication.actions";
import { User } from "./auth.model";
import { LoginAdminDto } from "@/app/interfaces/login-admin-dto";

@Injectable()
export class AuthenticationEffects {
  private actions$ = inject(Actions);

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) => {
        const loginData: LoginAdminDto = {
          username: email,
          password: password,
          rememberMe: false,
          verifyCode: "",
        };

        return this.authService.login(loginData).pipe(
          map((result) => {
            if (result.code === 1 && result.data) {
              const user: User = {
                id: result.data.id,
                email: result.data.email,
                // No username in LoginAdminVo
              };

              const returnUrl =
                this.route.snapshot.queryParams["returnUrl"] || "/";
              this.router.navigateByUrl(returnUrl);

              return loginSuccess({ user });
            }
            throw new Error(result.error?.message || "Login failed");
          }),
          catchError((error) => of(loginFailure({ error: error.message }))),
        );
      }),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() => {
        this.authService.logout();
        this.router.navigate(["/auth/login"]);
        return of(logoutSuccess());
      }),
    ),
  );
}
