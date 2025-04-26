import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzTypographyModule } from "ng-zorro-antd/typography";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { AuthService } from "../../../services/auth.service";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { LoginAdminDto } from "../../../interfaces/login-admin-dto";
import { finalize } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {NgIf} from "@angular/common";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzTypographyModule,
    NgIf,
  ],
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  returnUrl: string = "/";
  showVerifyCode = false;
  kaptchaUrl = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
      verifyCode: [""],
    });

    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/";

    // Redirect if already logged in
    /*if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }*/
  }

  submitForm(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData: LoginAdminDto = this.loginForm.value;

      this.authService
        .login(loginData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (result) => {
            if (result.code === 1) {
              window.location.href = "/dashboard";
              // this.router.navigate(["/dashboard"]);
            } else if (
              result.code === -5 &&
              result.error &&
              result.error.extra &&
              result.error.extra.count === result.error.extra.countSetting
            ) {
              this.showVerifyCode = true;
              this.loginForm
                .get("verifyCode")
                ?.setValidators(Validators.required);
              this.loginForm.get("verifyCode")?.updateValueAndValidity();
              this.refreshKaptcha();
            } else if (result.code === -100) {
              this.showVerifyCode = true;
              this.loginForm
                  .get("verifyCode")
                  ?.setValidators(Validators.required);
              this.loginForm.get("verifyCode")?.updateValueAndValidity();
              this.refreshKaptcha();
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.message.error(error || "Login Failed!");
          },
        });
    } else {
      Object.values(this.loginForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  refreshKaptcha(): void {
    // Adjust the endpoint as needed – here we assume a login-specific captcha endpoint.
    const headers = new HttpHeaders({
      "Content-Type": "image/jpeg",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    });

    this.http
      .get(
        `/security-service/anon/kaptcha/login-code?t=${Date.now()}`,
        { headers: headers, responseType: "blob" }
      )
      .subscribe((response) => {
        this.kaptchaUrl = URL.createObjectURL(response);
      });
  }

  navigateToSignup(): void {
    this.router.navigate(["/auth/signup"]);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(["/auth/forget-password"]);
  }

  navigateToPrivacy(): void {
    this.router.navigate(["/privacy"]);
  }
} 