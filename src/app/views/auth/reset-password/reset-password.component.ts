import { ForgetPasswordDto } from "@/app/interfaces/forget-password-dto";
import { AuthService } from "@/app/services/auth.service";
import { NgIf } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import { environment } from "@environment/environment";
import { NzMessageService } from "ng-zorro-antd/message";
import { CenteredLayoutComponent } from "../../../shared/components/centered-layout/centered-layout.component";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [
    AuthImageComponent,
    RouterLink,
    ReactiveFormsModule,
    NgIf,
    CenteredLayoutComponent,
  ],
  templateUrl: "./reset-password.component.html",
  styles: ``,
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  kaptchaUrl = "";
  countdownTime = 0;
  countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.refreshKaptcha();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      username: ["", [Validators.required]],
      verifyCode: ["", [Validators.required]],
    });
  }

  refreshKaptcha(): void {
    const headers = new HttpHeaders({
      "Content-Type": "image/jpeg",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    });

    this.http
      .get(
        `${environment.securityServiceUrl}/anon/kaptcha/forget-password-code?t=${Date.now()}`,
        { headers: headers, responseType: "blob" }
      )
      .subscribe((response) => {
        this.kaptchaUrl = URL.createObjectURL(response);
      });
  }

  submitForm(): void {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      const data: ForgetPasswordDto = this.resetPasswordForm.value;

      this.authService.forgetPassword(data).subscribe({
        next: (result) => {
          if (result.code === 1) {
            this.message.success(
              "Reset password email has been sent. Please check your email."
            );
            this.startCountdown();
          } else {
            this.message.error(
              result.error?.message || "Failed to process request"
            );
          }
          this.refreshKaptcha();
          this.isLoading = false;
        },
        error: () => {
          this.message.error("An error occurred. Please try again.");
          this.isLoading = false;
          this.refreshKaptcha();
        },
      });
    } else {
      Object.values(this.resetPasswordForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAllAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  // Start countdown timer after email is sent
  startCountdown(): void {
    this.countdownTime = 60;
    this.countdownInterval = setInterval(() => {
      this.countdownTime--;
      if (this.countdownTime <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  navigateToLogin(): void {
    this.router.navigate(["/auth/login"]);
  }
}
