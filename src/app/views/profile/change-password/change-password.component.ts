import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Subscription } from "rxjs";

import { ProfileService } from "@/app/services/profile.service";
import { AuthService } from "@/app/services/auth.service";
import { ToastService } from "@/app/shared";
import { ButtonComponent, IconComponent, SpinnerComponent } from "@/app/shared";
import { CenteredLayoutComponent } from "@/app/shared";

@Component({
  selector: "app-change-password",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    SpinnerComponent,
    CenteredLayoutComponent,
  ],
  template: `
    <app-centered-layout>
      <div class="change-password-container">
        <!-- Header with back navigation -->
        <div class="page-header">
          <app-button
            variant="ghost"
            size="small"
            (clicked)="navigateBack()"
            customClass="back-button"
          >
            <app-icon name="arrow-left" [size]="16"></app-icon>
            <span>Back to Chat</span>
          </app-button>
          <h1 class="page-title">Change Password</h1>
          <p class="page-description">Update your account password below.</p>
        </div>

        <!-- Change Password Form -->
        <div class="form-container">
          <form
            [formGroup]="passwordForm"
            (ngSubmit)="onSubmit()"
            class="password-form"
          >
            <!-- Current Password Field -->
            <div class="form-field">
              <label for="currentPassword" class="field-label">
                Current Password
              </label>
              <div class="input-wrapper">
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                  placeholder="Enter your current password"
                  class="form-input"
                  [class.error]="
                    passwordForm.get('currentPassword')?.invalid &&
                    passwordForm.get('currentPassword')?.touched
                  "
                />
              </div>
              <div
                *ngIf="
                  passwordForm.get('currentPassword')?.invalid &&
                  passwordForm.get('currentPassword')?.touched
                "
                class="field-error"
              >
                <span
                  *ngIf="
                    passwordForm.get('currentPassword')?.errors?.['required']
                  "
                >
                  Current password is required
                </span>
              </div>
            </div>

            <!-- New Password Field -->
            <div class="form-field">
              <label for="newPassword" class="field-label">
                New Password
              </label>
              <div class="input-wrapper">
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  placeholder="Enter your new password"
                  class="form-input"
                  [class.error]="
                    passwordForm.get('newPassword')?.invalid &&
                    passwordForm.get('newPassword')?.touched
                  "
                />
              </div>
              <div
                *ngIf="
                  passwordForm.get('newPassword')?.invalid &&
                  passwordForm.get('newPassword')?.touched
                "
                class="field-error"
              >
                <span
                  *ngIf="passwordForm.get('newPassword')?.errors?.['required']"
                >
                  New password is required
                </span>
                <span
                  *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']"
                >
                  Password must be at least 6 characters
                </span>
                <span
                  *ngIf="
                    passwordForm.get('newPassword')?.errors?.[
                      'invalidSpecialCharacters'
                    ]
                  "
                >
                  Password cannot contain (), !, *, or '
                </span>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="form-field">
              <label for="confirmPassword" class="field-label">
                Confirm New Password
              </label>
              <div class="input-wrapper">
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Confirm your new password"
                  class="form-input"
                  [class.error]="
                    passwordForm.get('confirmPassword')?.invalid &&
                    passwordForm.get('confirmPassword')?.touched
                  "
                />
              </div>
              <div
                *ngIf="
                  passwordForm.get('confirmPassword')?.invalid &&
                  passwordForm.get('confirmPassword')?.touched
                "
                class="field-error"
              >
                <span
                  *ngIf="
                    passwordForm.get('confirmPassword')?.errors?.['required']
                  "
                >
                  Please confirm your password
                </span>
                <span *ngIf="passwordForm.hasError('passwordMismatch')">
                  The passwords do not match
                </span>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <app-button
                type="submit"
                variant="primary"
                size="large"
                [disabled]="!passwordForm.valid || isSubmitting"
                customClass="submit-button"
              >
                <app-spinner
                  *ngIf="isSubmitting"
                  [simple]="true"
                  size="small"
                ></app-spinner>
                <span>{{
                  isSubmitting ? "Changing Password..." : "Change Password"
                }}</span>
              </app-button>
            </div>
          </form>
        </div>
      </div>
    </app-centered-layout>
  `,
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  passwordForm: FormGroup;
  isSubmitting = false;

  private userId = "";
  private userIdSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", [Validators.required]],
        newPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(6),
            this.validateSpecialCharacters.bind(this),
          ],
        ],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit(): void {
    // Subscribe to user ID
    this.userIdSubscription = this.authService.getUserId().subscribe((id) => {
      this.userId = id;
    });
  }

  ngOnDestroy(): void {
    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe();
    }
  }

  private validateSpecialCharacters(
    control: AbstractControl,
  ): ValidationErrors | null {
    const invalidChars = ["(", ")", "!", "*", "'"];
    const value = control.value;

    if (!value) return null;

    const hasInvalidChar = invalidChars.some((char) => value.includes(char));
    return hasInvalidChar ? { invalidSpecialCharacters: true } : null;
  }

  private passwordMatchValidator(
    formGroup: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = formGroup.get("newPassword")?.value;
    const confirmPassword = formGroup.get("confirmPassword")?.value;

    if (newPassword === confirmPassword) {
      formGroup.get("confirmPassword")?.setErrors(null);
      return null;
    } else {
      const confirmControl = formGroup.get("confirmPassword");
      const currentErrors = confirmControl?.errors || {};
      confirmControl?.setErrors({ ...currentErrors, passwordMismatch: true });
      return { passwordMismatch: true };
    }
  }

  navigateBack(): void {
    this.router.navigate(["/rewrite"]);
  }

  onSubmit(): void {
    if (!this.passwordForm.valid || !this.userId || this.isSubmitting) return;

    this.isSubmitting = true;

    const payload = {
      id: this.userId,
      password: this.passwordForm.get("newPassword")?.value,
    };

    this.profileService.updateUserDetails(payload).subscribe({
      next: (result) => {
        this.isSubmitting = false;

        if (result.code === 1) {
          this.toastService.success("Password changed successfully");
          this.passwordForm.reset();
          // Navigate back to chat after successful password change
          setTimeout(() => {
            this.navigateBack();
          }, 1500);
        } else {
          this.toastService.error(
            "Failed to change password. Please try again.",
          );
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error(error);
        this.toastService.error("An error occurred while changing password");
      },
    });
  }
}
