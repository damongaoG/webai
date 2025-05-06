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
import { MessageService } from "@/app/shared";
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
  styles: `
    :host ::ng-deep {
      .ant-message-notice-content {
        padding: 12px 16px;
        border-radius: 4px;
        box-shadow:
          0 3px 6px -4px rgba(0, 0, 0, 0.12),
          0 6px 16px 0 rgba(0, 0, 0, 0.08);
      }

      .ant-message-success .ant-message-notice-content {
        background-color: #f6ffed;
        border: 1px solid #b7eb8f;
      }

      .ant-message-error .ant-message-notice-content {
        background-color: #fff2f0;
        border: 1px solid #ffccc7;
      }
    }
  `,
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
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.refreshKaptcha();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      username: ["", [Validators.required, Validators.email]],
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

      const formValue = this.resetPasswordForm.value;

      const data: ForgetPasswordDto = {
        username: formValue.username.trim(),
        verifyCode: formValue.verifyCode.trim(),
      };

      this.authService.forgetPassword(data).subscribe({
        next: (result) => {
          if (result.code === 1) {
            this.messageService.success(
              "Reset password email has been sent. Please check your email."
            );
            this.startCountdown();
          } else {
            this.messageService.error(
              result.error?.message || "Failed to process request"
            );
          }
          this.refreshKaptcha();
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Reset password error:", err);
          this.messageService.error("An error occurred. Please try again.");
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
