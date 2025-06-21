import { Component, inject, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "@/app/services/auth.service";
import { IconComponent } from "@/app/shared";

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="user-menu-container">
      <!-- User info display -->
      <div class="user-info">
        <span class="user-email text-sm text-gray-300">
          {{ userEmail$ | async }}
        </span>
      </div>

      <!-- Menu dropdown -->
      <div class="relative">
        <button
          type="button"
          class="menu-trigger"
          (click)="toggleMenu()"
          [class.active]="isMenuOpen"
        >
          <app-icon name="menu" [size]="20"></app-icon>
        </button>

        <!-- Dropdown menu -->
        <div
          *ngIf="isMenuOpen"
          class="menu-dropdown"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            class="menu-item"
            (click)="handleChangePassword()"
          >
            <app-icon name="key" [size]="16"></app-icon>
            <span>Change Password</span>
          </button>

          <button
            type="button"
            class="menu-item text-red-400 hover:text-red-300"
            (click)="handleLogout()"
          >
            <app-icon name="logout" [size]="16"></app-icon>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop to close menu when clicking outside -->
    <div
      *ngIf="isMenuOpen"
      class="fixed inset-0 z-10"
      (click)="closeMenu()"
    ></div>
  `,
  styles: [
    `
      .user-menu-container {
        display: flex;
        align-items: center;
        gap: 1rem;
        position: relative;
      }

      .user-info {
        display: flex;
        align-items: center;
      }

      .user-email {
        font-weight: 500;
      }

      .menu-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 1px solid #374151;
        border-radius: 8px;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .menu-trigger:hover {
        background: #1f2937;
        border-color: #4b5563;
        color: #d1d5db;
      }

      .menu-trigger.active {
        background: #1f2937;
        border-color: #3b82f6;
        color: #3b82f6;
      }

      .menu-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 180px;
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        z-index: 20;
        overflow: hidden;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        color: #d1d5db;
        font-size: 0.875rem;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .menu-item:hover {
        background: #374151;
      }

      .menu-item:active {
        background: #4b5563;
      }

      .menu-item + .menu-item {
        border-top: 1px solid #374151;
      }

      /* Focus styles for accessibility */
      .menu-trigger:focus,
      .menu-item:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `,
  ],
})
export class UserMenuComponent {
  private authService = inject(AuthService);

  // Output events for parent component
  changePassword = output<void>();
  logout = output<void>();

  // Component state
  isMenuOpen = false;

  // User email observable
  userEmail$ = this.authService.getUserEmail();

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  handleChangePassword(): void {
    this.closeMenu();
    this.changePassword.emit();
  }

  handleLogout(): void {
    this.closeMenu();
    this.logout.emit();
  }
}
