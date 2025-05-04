import { ResendValidateEmailDto } from "./../../../interfaces/resend-validate-email-dto";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { RegistrationService } from "@/app/services/registration.service";
import { NzMessageService } from "ng-zorro-antd/message";
import { RegistryCustomerDto } from "@/app/interfaces/registry-customer-dto";
import { EmailValidators } from "@/app/shared/validators/email.validator";
import { PasswordValidators } from "@/app/shared/validators/password.validator";
import { NgIf } from "@angular/common";
import { CenteredLayoutComponent } from "@/app/shared/components";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    RouterLink,
    AuthImageComponent,
    ReactiveFormsModule,
    NgIf,
    CenteredLayoutComponent,
  ],
  templateUrl: "./register.component.html",
  styles: ``,
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  verificationForm!: FormGroup;
  isLoading = false;
  showVerification = false;
  kaptchaUrl = "";
  countdownTime = 0;
  countdownInterval: any;
  registeredUsername = "";
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private router: Router,
    private message: NzMessageService,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const routeSub = this.route.queryParams.subscribe((params) => {
      if (params["showVerification"] === "true") {
        this.showVerification = true;
        this.refreshKaptcha();
      }
      if (params["username"]) {
        this.registeredUsername = params["username"];
      }
    });
    this.subscriptions.push(routeSub);
  }

  ngOnDestroy(): void {
    // Clear any subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe);

    // Clear any intervals
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  submitForm() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const registerData: RegistryCustomerDto = {
        username: this.registerForm.get("email")?.value,
        password: this.registerForm.get("password")?.value,
        invitationCode: this.registerForm.get("invitationCode")?.value,
        nickName: this.registerForm.get("nickName")?.value || undefined,
        roleIds: ["2"],
      };

      const regSub = this.registrationService
        .registerUser(registerData)
        .subscribe({
          next: (result) => {
            if (result.code === 1) {
              this.registeredUsername = registerData.username;
              this.showVerification = true;
              this.initVerificationForm();
              this.refreshKaptcha();
            }
            this.isLoading = false;
          },
          error: (error: any) => {
            this.message.error(error.message || "Registration failed");
            this.isLoading = false;
          },
        });
      this.subscriptions.push(regSub);
    } else {
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
      this.registerForm.updateValueAndValidity();
    }
  }

  refreshKaptcha() {
    const capSub = this.registrationService
      .getVerificationCaptcha()
      .subscribe((response) => {
        this.kaptchaUrl = URL.createObjectURL(response);
      });
    this.subscriptions.push(capSub);
  }

  startCountdown() {
    this.countdownTime = 60;
    this.countdownInterval = setInterval(() => {
      if (this.countdownTime > 0) {
        this.countdownTime--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  resendEmail() {
    if (
      this.countdownTime > 0 ||
      !this.verificationForm.get("verifyCode")?.value
    ) {
      return;
    }

    const payload: ResendValidateEmailDto = {
      username: this.registeredUsername,
      verifyCode: this.verificationForm.get("verifyCode")?.value,
    };

    const resSub = this.registrationService
      .resendVerificationEmail(payload)
      .subscribe({
        next: (result) => {
          if (result.code === 1) {
            this.message.success("Verification email sent successfully");
            this.startCountdown();
          } else if (result.code === -100) {
            this.message.error("The verification code is invalid");
          } else {
            this.message.error("Failed to send verification email");
          }
          this.refreshKaptcha();
        },
        error: (error) => {
          this.message.error(
            error.message || "Failed to send verification email"
          );
          this.refreshKaptcha();
        },
      });
    this.subscriptions.push(resSub);
  }

  private initVerificationForm() {
    this.verificationForm = this.fb.group({
      verifyCode: ["", [Validators.required]],
    });
  }

  navigateToLogin() {
    this.router.navigate(["/auth/login"]);
  }

  private initForm() {
    this.registerForm = this.fb.group(
      {
        email: [
          "",
          [
            Validators.required,
            Validators.email,
            EmailValidators.emailFormatValidator(),
          ],
        ],
        nickName: ["", [Validators.minLength(2), Validators.maxLength(20)]],
        invitationCode: ["", [Validators.required]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            PasswordValidators.specialCharactersValidator(),
          ],
        ],
        confirmPassword: ["", [Validators.required]],
        rememberMe: [false],
      },
      {
        Validators: PasswordValidators.passwordMatchValidator(),
      }
    );

    this.verificationForm = this.fb.group({
      verifyCode: ["", Validators.required],
    });
  }
}
