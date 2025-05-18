import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, from, Observable, switchMap, tap } from "rxjs";
import { LoginAdminDto } from "../interfaces/login-admin-dto";
import { LoginAdminVo } from "../interfaces/login-admin-vo";
import { RegistryCustomerDto } from "../interfaces/registry-customer-dto";
import { RegistryCustomerVo } from "../interfaces/registry-customer-vo";
import { ResendValidateEmailDto } from "../interfaces/resend-validate-email-dto";
import { Result } from "../interfaces/result";
import { ForgetPasswordDto } from "../interfaces/forget-password-dto";
import { ValidateForgetPasswordDto } from "../interfaces/validate-forget-password-dto";
import { environment } from "@environment/environment";
import { ToastService } from "../shared";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  apiUrl = environment.securityServiceUrl;
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  private tokenKey = "auth_token";
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userEmailSubject = new BehaviorSubject<string>("User");
  private userIdSubject = new BehaviorSubject<string>("");
  private isRefreshing = false;
  private restrictedRoutes = ["/chat", "/activate", "/profile/change-password"];
  private userRoleIdSubject = new BehaviorSubject<string>("");

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private toastService: ToastService,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject = new BehaviorSubject<boolean>(
        this.hasValidToken(),
      );
    }
  }

  login(data: LoginAdminDto): Observable<Result<LoginAdminVo>> {
    return this.http
      .post<
        Result<LoginAdminVo>
      >(this.apiUrl + "/anon/auth/login-customer", data)
      .pipe(
        tap((result) => {
          if (result.code === 1) {
            this.setToken("true");
            this.isAuthenticatedSubject.next(true);
            if (result.data?.email) {
              this.userEmailSubject.next(result.data.email);
            }
            if (result.data?.id) {
              this.userIdSubject.next(result.data.id);
            }
          } else if (result.code === -7) {
            this.toastService.error("This account not user account");
          } else if (result.code === -5) {
            this.toastService.error("Username or password wrong");
          } else if (result.code === -9) {
            this.toastService.error("The user has already been logged in.");
          } else if (result.code === -6) {
            this.router.navigate(["/auth/signup"], {
              queryParams: { showVerification: true, username: data.username },
            });
          } else if (result.code === -100) {
            this.toastService.error("Verify code incorrect, please try again.");
          } else {
            this.toastService.error("Login failed");
          }
        }),
      );
  }

  logout(): Observable<Result<any>> {
    const nsParam = "";
    const logoutUrl = this.apiUrl + "/anon/auth/logout" + nsParam;
    return this.http
      .get<Result<any>>(logoutUrl, {
        headers: this.headers,
      })
      .pipe(
        switchMap((result) => {
          if (result.code !== 1) {
            this.toastService.error("Unable to logout");
            return from(Promise.resolve(result));
          }

          this.completeLogout();
          return from(Promise.resolve(result));
        }),
      );
  }

  private completeLogout(): void {
    this.removeToken();
    this.isAuthenticatedSubject.next(false);
    this.userEmailSubject.next("User");
    this.userIdSubject.next("");
    this.userRoleIdSubject.next("");
    this.router.navigate(["/auth/login"]);
  }

  reLogIn(): Observable<Result<LoginAdminVo>> {
    this.isRefreshing = true;
    return this.http
      .get<Result<LoginAdminVo>>(this.apiUrl + "/anon/auth/re-login", {
        headers: this.headers,
      })
      .pipe(
        tap((result) => {
          this.isRefreshing = false;
          if (result.code === 1 && result.data?.status !== 0) {
            this.setToken("true");
            this.isAuthenticatedSubject.next(true);
            if (result.data?.email) {
              this.userEmailSubject.next(result.data.email);
            }
            if (result.data?.id) {
              this.userIdSubject.next(result.data.id);
            }

            // Store the user's role ID
            if (result.data?.roles && result.data.roles.length > 0) {
              this.userRoleIdSubject.next(result.data.roles[0].id);
            }

            // Check if user has role ID "1" and restrict access to specific routes
            const hasRestrictedRole = result.data?.roles?.[0]?.id === "1";
            const currentUrl = this.router.url;
            const isRestrictedRoute = this.restrictedRoutes.some((route) =>
              currentUrl.startsWith(route),
            );

            // Redirect to login if user has role ID "1" and is trying to access a restricted route
            if (hasRestrictedRole && isRestrictedRoute) {
              this.router.navigate(["/auth/login"]);
              return;
            }

            if (this.router.url === "/auth/login") {
              this.router.navigate(["/dashboard"]);
            }
          } else {
            this.removeToken();
            this.isAuthenticatedSubject.next(false);
            this.userEmailSubject.next("User");
            this.userIdSubject.next("");
          }
        }),
      );
  }

  isAuthenticated(): boolean {
    if (this.isRefreshing) {
      return true;
    }
    return this.isAuthenticatedSubject.getValue();
  }

  private hasValidToken(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return localStorage.getItem(this.tokenKey) === "true";
  }

  private setToken(value: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, value);
    }
  }
  private removeToken() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  signup(data: RegistryCustomerDto): Observable<Result<RegistryCustomerVo>> {
    return this.http
      .post<
        Result<RegistryCustomerVo>
      >(this.apiUrl + "/anon/auth/registry-user", data, { headers: this.headers })
      .pipe(
        tap((result) => {
          if (result.code === 1) {
            this.toastService.success("Registration successful");
          } else if (result.code === -4) {
            this.toastService.error("The invitation code is invalid");
          } else {
            this.toastService.error("Registration error");
          }
        }),
      );
  }
  resendValidateEmail(data: ResendValidateEmailDto): Observable<Result<any>> {
    return this.http.post<Result<any>>(
      `${this.apiUrl}/anon/auth/resend-validate-email`,
      data,
      { headers: this.headers },
    );
  }

  forgetPassword(data: ForgetPasswordDto): Observable<Result<any>> {
    return this.http.post<Result<any>>(
      `${this.apiUrl}/anon/auth/forget-password`,
      data,
      { headers: this.headers },
    );
  }

  validateForgetPassword(
    data: ValidateForgetPasswordDto,
  ): Observable<Result<any>> {
    return this.http.post<Result<any>>(
      `${this.apiUrl}/anon/auth/validate-forget-password`,
      data,
      { headers: this.headers },
    );
  }

  getUserId(): Observable<string> {
    return this.userIdSubject.asObservable();
  }

  canAccessRoute(route: string): boolean {
    // Check if the user is an admin (has role ID "1")
    // If so, they should not access certain routes
    const roleId = this.userRoleIdSubject.getValue();
    const isAdmin = roleId === "1";

    if (isAdmin) {
      return !this.restrictedRoutes.some((r) => route.startsWith(r));
    }

    return true;
  }

  getUserRoleId(): Observable<string> {
    return this.userRoleIdSubject.asObservable();
  }
}
