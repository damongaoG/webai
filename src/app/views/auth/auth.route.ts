import type { Route } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { QrLoginComponent } from "./qr-login/qr-login.component";
import { RegisterComponent } from "./register/register.component";
import { LockScreenComponent } from "./lock-screen/lock-screen.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { LogoutComponent } from "./logout/logout.component";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";
import { loginRedirectGuard } from "@/app/guards/login-redirect.guard";

export const AUTH_PAGES_ROUTES: Route[] = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [loginRedirectGuard],
    data: { title: "Login" },
  },
  {
    path: "qr-login",
    component: QrLoginComponent,
    data: { title: "Qr Login" },
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [loginRedirectGuard],
    data: { title: "Register" },
  },
  {
    path: "lock-screen",
    component: LockScreenComponent,
    data: { title: "Lock Screen" },
  },
  {
    path: "forgot-pw",
    component: ResetPasswordComponent,
    canActivate: [loginRedirectGuard],
    data: { title: "Reset Password" },
  },
  {
    path: "forget-password",
    component: ForgetPasswordComponent,
    canActivate: [loginRedirectGuard],
    data: { title: "Set New Password" },
  },
  {
    path: "logout",
    component: LogoutComponent,
    data: { title: "Logout" },
  },
];
