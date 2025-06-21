import { Component, inject, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "@/app/services/auth.service";
import { ToastService } from "@/app/shared";
import { ButtonComponent } from "@/app/shared";
import { IconComponent } from "@/app/shared";
import { ModalComponent } from "@/app/shared";

@Component({
  selector: "app-logout-confirmation-modal",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, ModalComponent],
  template: `
    <app-modal
      [visible]="visible()"
      [title]="'Confirm Logout'"
      [showFooter]="false"
      [showCloseButton]="true"
      [customClass]="'max-w-sm'"
      [maskClosable]="true"
      (cancel)="handleCancel()"
      (visibleChange)="onVisibleChange($event)"
    >
      <!-- Logout confirmation content -->
      <div class="logout-content">
        <div class="flex items-center gap-3 mb-4">
          <div class="warning-icon">
            <app-icon
              name="warning"
              [size]="24"
              class="text-yellow-500"
            ></app-icon>
          </div>
          <div>
            <h4 class="text-lg font-semibold text-gray-900">
              Are you sure you want to logout?
            </h4>
            <p class="text-sm text-gray-600 mt-1">
              You will need to sign in again to access your account.
            </p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <app-button
            type="button"
            variant="default"
            (clicked)="handleCancel()"
            [disabled]="isLoggingOut"
          >
            Cancel
          </app-button>
          <app-button
            type="button"
            variant="primary"
            customClass="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
            (clicked)="handleLogout()"
            [loading]="isLoggingOut"
            [disabled]="isLoggingOut"
          >
            <span>{{ isLoggingOut ? "Logging out..." : "Logout" }}</span>
          </app-button>
        </div>
      </div>
    </app-modal>
  `,
  styles: [
    `
      .logout-content {
        min-width: 280px;
      }

      .warning-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: #fef3c7;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .warning-icon app-icon {
        color: #f59e0b;
      }
    `,
  ],
})
export class LogoutConfirmationModalComponent {
  visible = input.required<boolean>();

  // Output events
  visibleChange = output<boolean>();
  loggedOut = output<void>();

  // Component state
  isLoggingOut = false;

  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  handleLogout(): void {
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;

    this.authService.logout().subscribe({
      next: (result) => {
        this.isLoggingOut = false;
        if (result.code === 1) {
          this.loggedOut.emit();
          this.handleCancel();
        } else {
          this.toastService.error(result.error?.message || "Logout failed");
        }
      },
      error: (error: any) => {
        this.isLoggingOut = false;
        console.error("Logout error:", error);
        this.toastService.error("An error occurred during logout");
      },
    });
  }

  onVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  handleCancel(): void {
    if (!this.isLoggingOut) {
      this.visibleChange.emit(false);
    }
  }
}
