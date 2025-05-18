import { LoginComponent } from "@/app/views/auth/login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RegisterComponent } from "./register/register.component";
import { ResetPasswordComponent } from "@/app/views/auth/reset-password/reset-password.component";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "forgot-pw",
    component: ResetPasswordComponent,
    data: { title: "Reset Password" },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
