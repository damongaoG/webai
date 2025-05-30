import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { AuthService } from "@/app/services/auth.service";
import { ModalService, ButtonComponent, IconComponent } from "@/app/shared";

@Component({
  selector: "app-user-menu",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  template: `
    <div class="user-menu">
      <!-- User Email Display -->
      <div class="user-email-display">
        <span class="user-email">{{ truncateEmail(userEmail) }}</span>
      </div>

      <!-- User Menu Dropdown -->
      <div class="user-dropdown" [class.open]="isDropdownOpen">
        <app-button
          variant="ghost"
          shape="circle"
          size="medium"
          (clicked)="toggleDropdown()"
          title="User menu"
          customClass="user-menu-trigger"
        >
          <app-icon name="user" [size]="16"></app-icon>
        </app-button>

        <!-- Dropdown Menu -->
        <div class="dropdown-content" *ngIf="isDropdownOpen">
          <div class="dropdown-header">
            <div class="user-info">
              <div class="user-email-full">{{ userEmail }}</div>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <div class="dropdown-menu">
            <button class="dropdown-item" (click)="navigateToChangePassword()">
              <app-icon name="lock" [size]="16"></app-icon>
              <span>Change Password</span>
            </button>

            <button class="dropdown-item" (click)="navigateToActivationCode()">
              <app-icon name="key" [size]="16"></app-icon>
              <span>Activation Code</span>
            </button>

            <div class="dropdown-divider"></div>

            <button class="dropdown-item logout" (click)="showLogoutConfirm()">
              <app-icon name="log-out" [size]="16"></app-icon>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop for mobile -->
    <div
      class="dropdown-backdrop"
      *ngIf="isDropdownOpen"
      (click)="closeDropdown()"
    ></div>
  `,
  styleUrls: ["./user-menu.component.scss"],
})
export class UserMenuComponent implements OnInit, OnDestroy {
  userEmail = "User";
  isDropdownOpen = false;
  private emailSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    // Subscribe to user email changes
    this.emailSubscription = this.authService
      .getUserEmail()
      .subscribe((email) => {
        this.userEmail = email;
      });

    // Close dropdown when clicking outside
    document.addEventListener("click", this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    document.removeEventListener("click", this.onDocumentClick.bind(this));
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const userMenu = target.closest(".user-menu");

    if (!userMenu) {
      this.closeDropdown();
    }
  }

  truncateEmail(email: string): string {
    if (email.length > 20) {
      return `${email.substring(0, 15)}...`;
    }
    return email;
  }

  navigateToChangePassword(): void {
    this.closeDropdown();
    this.router.navigate(["/profile.change-password"]);
  }

  navigateToActivationCode(): void {
    this.closeDropdown();
    this.router.navigate(["/profile/activation-code"]);
  }

  showLogoutConfirm(): void {
    this.closeDropdown();
    this.modalService.confirm({
      title: "Are you sure you want to logout?",
      centered: true,
      onOk: () => this.logout(),
    });
  }

  private logout(): void {
    this.authService.logout().subscribe();
  }
}
