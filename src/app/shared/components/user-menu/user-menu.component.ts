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
      <!-- User info display - Hidden on small screens -->
      <div class="user-info hidden sm:flex">
        <span
          class="user-email text-xs sm:text-sm text-gray-300 truncate max-w-32 lg:max-w-none"
        >
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
          aria-label="User menu"
        >
          <app-icon name="menu" [size]="isMobileView() ? 18 : 20"></app-icon>
        </button>

        <!-- Dropdown menu -->
        <div
          *ngIf="isMenuOpen"
          class="menu-dropdown"
          (click)="$event.stopPropagation()"
        >
          <!-- Show user email on mobile at top of dropdown -->
          <div class="sm:hidden user-email-mobile">
            <span class="text-xs text-gray-400 truncate">
              {{ userEmail$ | async }}
            </span>
          </div>

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
            <app-icon name="log-out" [size]="16"></app-icon>
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
        gap: 0.5rem;
        position: relative;
      }

      @media (min-width: 640px) {
        .user-menu-container {
          gap: 1rem;
        }
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
        width: 36px;
        height: 36px;
        border: 1px solid #374151;
        border-radius: 8px;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      @media (min-width: 640px) {
        .menu-trigger {
          width: 40px;
          height: 40px;
        }
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
        min-width: 160px;
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        z-index: 20;
        overflow: hidden;
      }

      @media (min-width: 640px) {
        .menu-dropdown {
          min-width: 180px;
        }
      }

      .user-email-mobile {
        padding: 0.75rem 1rem 0.5rem;
        border-bottom: 1px solid #374151;
        margin-bottom: 0.25rem;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.625rem 1rem;
        border: none;
        background: transparent;
        color: #d1d5db;
        font-size: 0.8125rem;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      @media (min-width: 640px) {
        .menu-item {
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }
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

  // Check if current view is mobile/tablet
  isMobileView(): boolean {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 640;
    }
    return false;
  }

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
