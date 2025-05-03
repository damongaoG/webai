import { LoginComponent } from "@/app/views/auth/login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { RegisterComponent } from "./register/register.component";

const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path:"register",
    component: RegisterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
