import { LoginComponent } from "@/app/views/auth/login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RegisterComponent } from "./register/register.component";
import { ResetPasswordComponent } from "@/app/views/auth/reset-password/reset-password.component";
import { loginRedirectGuard } from "@/app/guards/login-redirect.guard";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    canActivate: [loginRedirectGuard],
  },
  {
    path: "register",
    component: RegisterComponent,
    canActivate: [loginRedirectGuard],
  },
  {
    path: "forgot-pw",
    component: ResetPasswordComponent,
    canActivate: [loginRedirectGuard],
    data: { title: "Reset Password" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
