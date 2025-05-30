import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { ButtonComponent, IconComponent } from "@/app/shared";
import { CenteredLayoutComponent } from "@/app/shared";

@Component({
  selector: "app-activation-code",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    CenteredLayoutComponent,
  ],
  template: `
    <app-centered-layout>
      <div class="activation-code-container">
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
          <h1 class="page-title">Account Activation</h1>
          <p class="page-description">
            Manage your account activation status and request new activation
            codes.
          </p>
        </div>

        <!-- Current Status Display -->
        <div class="status-card">
          <div class="status-header">
            <app-icon
              [name]="isActivated ? 'check-circle' : 'alert-circle'"
              [size]="24"
              [class]="
                isActivated ? 'status-icon-success' : 'status-icon-warning'
              "
            ></app-icon>
            <div class="status-info">
              <h3 class="status-title">
                {{
                  isActivated ? "Account Activated" : "Account Not Activated"
                }}
              </h3>
              <p class="status-description">
                <span *ngIf="isActivated">
                  Your account is fully activated and ready to use.
                </span>
                <span *ngIf="!isActivated">
                  Your account needs to be activated. Please check your email
                  for an activation code or request a new one below.
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Activation Actions -->
        <div class="actions-container" *ngIf="!isActivated">
          <!-- Request New Activation Code -->
          <div class="action-card">
            <div class="action-header">
              <h3>Request New Activation Code</h3>
              <p>
                We'll send a new activation code to your email address:
                <strong>{{ userEmail }}</strong>
              </p>
            </div>
          </div>

          <!-- Verify Activation Code -->
          <div class="action-card">
            <div class="action-header">
              <h3>Enter Activation Code</h3>
              <p>
                If you have received an activation code, enter it below to
                activate your account.
              </p>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div class="help-section">
          <div class="help-card">
            <app-icon
              name="help-circle"
              [size]="20"
              class="help-icon"
            ></app-icon>
            <div class="help-content">
              <h4>Need Help?</h4>
              <p>
                If you're having trouble with account activation, please check
                your spam folder or contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </app-centered-layout>
  `,
  styleUrls: ["./activation-code.component.scss"],
})
export class ActivationCodeComponent implements OnInit {
  activationForm!: FormGroup;
  userEmail = "";
  isActivated = false;
  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.activationForm = this.fb.group({
      activationCode: ["", [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {}

  navigateBack(): void {
    this.router.navigate(["/rewrite"]);
  }
}
