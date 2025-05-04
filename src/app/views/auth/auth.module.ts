import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

// Ng-Zorro modules
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzMessageModule } from "ng-zorro-antd/message";
import { NzAlertModule } from "ng-zorro-antd/alert";

// Shared components
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import { ThirdPartyLoginComponent } from "@components/third-party-login/third-party-login.component";

// Auth components
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { ResetPasswordComponent } from "./reset-password/reset-password.component";
import { LockScreenComponent } from "./lock-screen/lock-screen.component";
import { QrLoginComponent } from "./qr-login/qr-login.component";
import { LogoutComponent } from "./logout/logout.component";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";

// Auth routing
import { AuthRoutingModule } from "./auth-routing.module";

@NgModule({
  declarations: [],
  imports: [
    // Angular modules
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,

    // Routing
    AuthRoutingModule,

    // Ng-Zorro modules
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzMessageModule,
    NzAlertModule,

    // Components
    AuthImageComponent,
    ThirdPartyLoginComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    LockScreenComponent,
    QrLoginComponent,
    LogoutComponent,
    ForgetPasswordComponent,
  ],
  exports: [LoginComponent],
})
export class AuthModule {}
