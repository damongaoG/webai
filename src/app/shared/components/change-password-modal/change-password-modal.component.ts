import {
  Component,
  inject,
  input,
  output,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
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
import { ButtonComponent } from "@/app/shared";
import { SpinnerComponent } from "@/app/shared";
import { ModalComponent } from "@/app/shared";
import { ApiResponse } from "@/app/interfaces/profile.interface";

@Component({
  selector: "app-change-password-modal",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    SpinnerComponent,
    ModalComponent,
  ],
  template: `
    <app-modal
      [visible]="visible()"
      [title]="'Change Password'"
      [showFooter]="false"
      [showCloseButton]="true"
      [customClass]="'max-w-md'"
      (cancel)="handleCancel()"
      (visibleChange)="onVisibleChange($event)"
    >
      <!-- Change Password Form -->
      <form
        [formGroup]="passwordForm"
        (ngSubmit)="onSubmit()"
        class="password-form space-y-4"
      >
        <!-- New Password Field -->
        <div class="form-field">
          <label for="newPassword" class="field-label"> New Password </label>
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
            <span *ngIf="passwordForm.get('newPassword')?.errors?.['required']">
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
              *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']"
            >
              Please confirm your password
            </span>
            <span *ngIf="passwordForm.hasError('passwordMismatch')">
              The passwords do not match
            </span>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions flex justify-end space-x-3 pt-4">
          <app-button
            type="button"
            variant="default"
            (clicked)="handleCancel()"
            [disabled]="isSubmitting"
          >
            Cancel
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [disabled]="!passwordForm.valid || isSubmitting"
          >
            <app-spinner
              *ngIf="isSubmitting"
              [simple]="true"
              size="small"
            ></app-spinner>
            <span>{{ isSubmitting ? "Changing..." : "Change Password" }}</span>
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [
    `
      .password-form {
        min-width: 320px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      .form-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.875rem;
        transition: border-color 0.2s ease;
      }

      .form-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .form-input.error {
        border-color: #ef4444;
      }

      .field-error {
        font-size: 0.75rem;
        color: #ef4444;
      }

      .form-actions {
        border-top: 1px solid #e5e7eb;
        margin-top: 1.5rem;
        padding-top: 1rem;
      }
    `,
  ],
})
export class ChangePasswordModalComponent implements OnInit, OnDestroy {
  visible = input.required<boolean>();

  // Output events
  visibleChange = output<boolean>();
  passwordChanged = output<void>();

  // Form and state
  passwordForm: FormGroup;
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Subscriptions
  private userId = "";
  private userIdSubscription?: Subscription;

  constructor() {
    this.passwordForm = this.fb.group(
      {
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
    this.userIdSubscription = this.authService.getUserId().subscribe({
      next: (id) => {
        this.userId = id;
      },
      error: (error) => {
        console.error("Error getting user ID:", error);
        this.toastService.error("Unable to get user information");
      },
    });
  }

  ngOnDestroy(): void {
    this.userIdSubscription?.unsubscribe();
  }

  private validateSpecialCharacters(
    control: AbstractControl,
  ): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const invalidChars = /[()!*']/;
    if (invalidChars.test(value)) {
      return { invalidSpecialCharacters: true };
    }
    return null;
  }

  private passwordMatchValidator(
    formGroup: AbstractControl,
  ): ValidationErrors | null {
    const newPassword = formGroup.get("newPassword")?.value;
    const confirmPassword = formGroup.get("confirmPassword")?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.passwordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const newPassword = this.passwordForm.get("newPassword")?.value;

      this.profileService
        .updateUserDetails({
          id: this.userId,
          password: newPassword,
        })
        .subscribe({
          next: (result: ApiResponse) => {
            this.isSubmitting = false;
            if (result.code === 1) {
              this.toastService.success("Password changed successfully");
              this.passwordChanged.emit();
              this.handleCancel();
            } else {
              this.toastService.error(
                result.message || "Failed to change password",
              );
            }
          },
          error: (error: any) => {
            this.isSubmitting = false;
            console.error("Password change error:", error);
            this.toastService.error(
              "An error occurred while changing password",
            );
          },
        });
    }
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.resetForm();
    }
  }

  handleCancel(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.passwordForm.reset();
    this.isSubmitting = false;
  }
}
