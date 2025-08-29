import { AuthService } from "@/app/services/auth.service";
import { CenteredLayoutComponent } from "@/app/shared/components";
import { ToastService } from "@/app/shared/services/toast.service";
import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";

@Component({
  selector: "app-forget-password",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    AuthImageComponent,
    RouterLink,
    CenteredLayoutComponent,
  ],
  template: `
    <app-centered-layout>
      <div
        class="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-default-950/40 backdrop-blur-2xl"
      >
        <div class="grid gap-10 lg:grid-cols-2">
          <auth-image />

          <div class="flex h-full flex-col p-10 lg:ps-0">
            <div class="pb-10">
              <a href="index.html" class="flex">
                <img
                  src="assets/images/logo.png"
                  alt="dark logo"
                  class="h-10"
                />
              </a>
            </div>
            <div class="my-auto">
              <h4 class="mb-3 text-2xl font-bold text-white">Reset Password</h4>
              <p class="mb-8 max-w-sm text-default-300" *ngIf="isValidLink">
                Enter your new password below.
              </p>

              <ng-container *ngIf="isValidLink; else invalidLink">
                <form
                  [formGroup]="resetForm"
                  (ngSubmit)="onSubmit()"
                  class="text-start"
                >
                  <!-- New Password -->
                  <div class="mb-4">
                    <label
                      for="password"
                      class="mb-2 block text-base/normal font-semibold text-default-200"
                    >
                      New Password
                    </label>
                    <input
                      class="block w-full rounded border-default-200 border-white/10 bg-transparent px-3 py-1.5 text-white/80 focus:border-white/25 focus:ring-transparent"
                      type="password"
                      id="password"
                      formControlName="password"
                      placeholder="Enter new password"
                    />
                    <div
                      *ngIf="
                        resetForm.get('password')?.invalid &&
                        resetForm.get('password')?.touched
                      "
                      class="text-red-500 mt-1 text-sm"
                    >
                      <span
                        *ngIf="resetForm.get('password')?.errors?.['required']"
                      >
                        Please input your new password!
                      </span>
                      <span
                        *ngIf="resetForm.get('password')?.errors?.['minlength']"
                      >
                        Password must be at least 6 characters!
                      </span>
                      <span
                        *ngIf="
                          resetForm.get('password')?.errors?.[
                            'invalidSpecialCharacters'
                          ]
                        "
                      >
                        Password cannot contain (), !, *, or '
                      </span>
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div class="mb-4">
                    <label
                      for="confirmPassword"
                      class="mb-2 block text-base/normal font-semibold text-default-200"
                    >
                      Confirm Password
                    </label>
                    <input
                      class="block w-full rounded border-default-200 border-white/10 bg-transparent px-3 py-1.5 text-white/80 focus:border-white/25 focus:ring-transparent"
                      type="password"
                      id="confirmPassword"
                      formControlName="confirmPassword"
                      placeholder="Confirm new password"
                    />
                    <div
                      *ngIf="
                        resetForm.get('confirmPassword')?.invalid &&
                        resetForm.get('confirmPassword')?.touched
                      "
                      class="text-red-500 mt-1 text-sm"
                    >
                      <span
                        *ngIf="
                          resetForm.get('confirmPassword')?.errors?.['required']
                        "
                      >
                        Please confirm your password!
                      </span>
                      <span *ngIf="resetForm.hasError('passwordMismatch')">
                        The passwords do not match!
                      </span>
                    </div>
                  </div>

                  <div class="text-center">
                    <button
                      class="bg-primary-600/90 hover:bg-primary-600 group mt-5 inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                      type="submit"
                      [disabled]="!resetForm.valid || isSubmitting"
                    >
                      {{ isSubmitting ? "Resetting..." : "Reset Password" }}
                    </button>
                  </div>
                </form>
              </ng-container>

              <ng-template #invalidLink>
                <div class="text-red-500">
                  Invalid or expired reset link. Please request a new password
                  reset.
                </div>
                <div class="text-center mt-5">
                  <button
                    class="bg-primary-600/90 hover:bg-primary-600 group inline-flex w-full items-center justify-center rounded-lg px-6 py-2 text-white backdrop-blur-2xl transition-all duration-500"
                    type="button"
                    (click)="navigateToForgotPassword()"
                  >
                    Request New Password Reset
                  </button>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-5 w-full text-center">
        <p class="text-base font-medium leading-6 text-default-300">
          Back To
          <a routerLink="/auth/login" class="ms-1 font-semibold text-primary"
            >Log In</a
          >
        </p>
      </div>
    </app-centered-layout>
  `,
  styles: ``,
})
export class ForgetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  isValidLink = false;
  isSubmitting = false;
  private source: string | null = null;
  private key: string | null = null;

  private validateSpecialCharacters(
    control: AbstractControl,
  ): ValidationErrors | null {
    const invalidChars = ["(", ")", "!", "*", "'"];
    const value = control.value;
    if (!value) return null;
    const hasInvalidChar = invalidChars.some((char) => value.includes(char));
    return hasInvalidChar ? { invalidSpecialCharacters: true } : null;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    this.resetForm = this.fb.group(
      {
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            this.validateSpecialCharacters,
          ],
        ],
        confirmPassword: ["", Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  private passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    const password = g.get("password")?.value;
    const confirmPassword = g.get("confirmPassword")?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.source = params["source"];
      this.key = params["key"];
      console.log(this.source, this.key);
      this.isValidLink = true;
    });

    if (!this.source || !this.key) {
      this.isValidLink = false;
      return;
    }
  }

  onSubmit() {
    if (this.resetForm.valid && this.source && this.key) {
      this.isSubmitting = true;
      const password = this.resetForm.get("password")?.value;

      const payload = {
        username: this.source,
        password: password,
        code: this.key,
      };

      this.authService.validateForgetPassword(payload).subscribe({
        next: (result) => {
          this.isSubmitting = false;
          if (result.code === 1) {
            this.toastService.success("Password reset successfully");
            this.router.navigate(["/auth/login"]);
          } else if (result.code === -4) {
            this.toastService.error("The code is invalid or expired");
          } else {
            this.toastService.error("Failed to reset password");
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.toastService.error(error || "Failed to reset password");
        },
      });
    }
  }

  navigateToForgotPassword() {
    this.router.navigate(["/auth/forgot-pw"]);
  }
}
