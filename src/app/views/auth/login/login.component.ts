import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import { ThirdPartyLoginComponent } from "@components/third-party-login/third-party-login.component";
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
  type UntypedFormGroup,
} from "@angular/forms";
import { Store } from "@ngrx/store";
import { login } from "@store/authentication/authentication.actions";
import { getError } from "@store/authentication/authentication.selector";
import { NgClass, NgIf } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { NzMessageService } from "ng-zorro-antd/message";
import { AuthService } from "@/app/services/auth.service";
import { finalize } from "rxjs";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    RouterLink,
    AuthImageComponent,
    ThirdPartyLoginComponent,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
  ],
  templateUrl: "./login.component.html",
  styles: ``,
})
export class LoginComponent implements OnInit {
  signInForm!: UntypedFormGroup;
  submitted: boolean = false;

  isLoading = false;

  errorMessage: string = "";

  showVerifyCode: boolean = false;
  kaptchaUrl: string = "";

  returnUrl = "/";

  public fb = inject(UntypedFormBuilder);
  public store = inject(Store);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      rememberMe: [false],
      verifyCode: [""],
    });

    // Get return URL
    this.returnUrl =
      this.route.snapshot.queryParams["returnUrl"] || "/dashboard";
  }

  get formValues() {
    return this.signInForm.controls;
  }

  login() {
    this.submitted = true;
    if (this.signInForm.valid) {
      this.isLoading = true;

      const email = this.formValues["email"].value; // Get the username from the form
      const password = this.formValues["password"].value; // Get the password from the form
      const loginData = {
        username: email,
        password: password,
        rememberMe: this.formValues["rememberMe"]?.value || false,
        verifyCode: this.formValues["verifyCode"]?.value || "",
      };

      // Login Api
      this.store.dispatch(login({ email: email, password: password }));

      this.store.select(getError).subscribe((data) => {
        if (data) {
          this.errorMessage = data.error.message;
          this.isLoading = false;

          setTimeout(() => {
            this.errorMessage = "";
          }, 3000);
        }
      });

      this.authService
        .login(loginData)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (result) => {
            if (result.code === 1) {
              this.router.navigate([this.returnUrl]);
            } else if (
              result.code === -5 &&
              result.error?.extra?.count === result.error?.extra?.countSetting
            ) {
              this.showVerifyCode = true;
              this.signInForm
                .get("verifyCode")
                ?.setValidators(Validators.required);
              this.signInForm.get("verifyCode")?.updateValueAndValidity();
              this.refreshKaptcha();
            } else if (result.code === -100) {
              this.showVerifyCode = true;
              this.signInForm
                .get("verifyCode")
                ?.setValidators(Validators.required);
              this.signInForm.get("verifyCode")?.updateValueAndValidity();
              this.refreshKaptcha();
            }
          },
          error: (error) => {
            this.message.error(error || "Login Failed!");
          },
        });
    } else {
      // Mark all controls as touched if form is invalid
      Object.values(this.signInForm.controls).forEach((control) => {
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  refreshKaptcha() {
    const headers = new HttpHeaders({
      "Content-Type": "image/jpeg",

      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    });

    this.http

      .get(`/security-service/anon/kaptcha/login-code?t=${Date.now()}`, {
        headers: headers,

        responseType: "blob",
      })

      .subscribe((response) => {
        this.kaptchaUrl = URL.createObjectURL(response);
      });
  }

  navigateToSignup() {
    this.router.navigate(["/auth/register"]);
  }

  navigateToForgotPassword() {
    this.router.navigate(["/auth/forgot-pw"]);
  }
}
