import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardSidebarComponent } from "./components/sidebar/sidebar.component";
import {
  SidebarStateService,
  ContentType,
} from "../../services/sidebar-state.service";
import { ChatBotComponent } from "@components/rewrite-model/components/chat-bot/chat-bot.component";
import { DashboardContentComponent } from "./components/content/dashboard-content.component";
import { ChatHistoryComponent } from "@components/chat-history/chat-history.component";
import { EssayHistoryComponent } from "@components/essay-history/essay-history.component";
import {
  UserMenuComponent,
  ChangePasswordModalComponent,
  LogoutConfirmationModalComponent,
} from "@/app/shared";

// Interface for user credits data
@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    DashboardSidebarComponent,
    ChatBotComponent,
    DashboardContentComponent,
    ChatHistoryComponent,
    EssayHistoryComponent,
    UserMenuComponent,
    ChangePasswordModalComponent,
    LogoutConfirmationModalComponent,
  ],
  template: `
    <div class="dashboard-container h-screen flex overflow-hidden bg-black">
      <!-- Sidebar -->
      <app-dashboard-sidebar></app-dashboard-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-auto">
        <!-- Content based on sidebar selection -->
        @switch (sidebarState.selectedContent()) {
          @case (ContentType.DASHBOARD) {
            <div class="dashboard-welcome-container h-full bg-gray-900">
              <div
                class="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <h1 class="text-2xl font-bold text-white">Dashboard</h1>
                  <p class="text-gray-400 mt-1">
                    Welcome to your AI-powered workspace
                  </p>
                </div>
                <app-user-menu
                  (changePassword)="showChangePasswordModal()"
                  (logout)="showLogoutConfirmation()"
                ></app-user-menu>
              </div>
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="mb-8">
                    <div
                      class="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4"
                    >
                      <svg
                        class="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2v0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <h2 class="text-4xl font-bold text-white mb-4">
                    Welcome to our website
                  </h2>
                  <p class="text-gray-400 text-lg max-w-md mx-auto">
                    Your AI-powered content creation journey begins here.
                    Explore our powerful tools to enhance your writing
                    experience.
                  </p>
                </div>
              </div>
            </div>
          }
          @case (ContentType.REWRITE_MODEL) {
            <div class="rewrite-model-container h-full bg-gray-900">
              <div
                class="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <h1 class="text-2xl font-bold text-white">Rewrite Model</h1>
                  <p class="text-gray-400 mt-1">
                    AI-powered text rewriting assistant
                  </p>
                </div>
                <app-user-menu
                  (changePassword)="showChangePasswordModal()"
                  (logout)="showLogoutConfirmation()"
                ></app-user-menu>
              </div>
              <div class="h-full">
                <app-chat-bot></app-chat-bot>
              </div>
            </div>
          }
          @case (ContentType.ESSAY_MODEL) {
            <div class="essay-model-container h-full bg-gray-900">
              <div
                class="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <h1 class="text-2xl font-bold text-white">Essay Model</h1>
                  <p class="text-gray-400 mt-1">
                    Comprehensive essay writing assistance
                  </p>
                </div>
                <app-user-menu
                  (changePassword)="showChangePasswordModal()"
                  (logout)="showLogoutConfirmation()"
                ></app-user-menu>
              </div>
              <div class="flex-1 overflow-hidden">
                <app-dashboard-content></app-dashboard-content>
              </div>
            </div>
          }
          @case (ContentType.REWRITE_HISTORY) {
            <div class="rewrite-history-container h-full bg-gray-900">
              <div
                class="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <h1 class="text-2xl font-bold text-white">Rewrite History</h1>
                  <p class="text-gray-400 mt-1">
                    Your rewrite conversation history
                  </p>
                </div>
                <app-user-menu
                  (changePassword)="showChangePasswordModal()"
                  (logout)="showLogoutConfirmation()"
                ></app-user-menu>
              </div>
              <div class="p-6 h-full">
                <app-chat-history></app-chat-history>
              </div>
            </div>
          }
          @case (ContentType.ESSAY_HISTORY) {
            <div class="essay-history-container h-full bg-gray-900">
              <div
                class="p-4 border-b border-gray-700 flex justify-between items-center"
              >
                <div>
                  <h1 class="text-2xl font-bold text-white">Essay History</h1>
                  <p class="text-gray-400 mt-1">Your essay writing history</p>
                </div>
                <app-user-menu
                  (changePassword)="showChangePasswordModal()"
                  (logout)="showLogoutConfirmation()"
                ></app-user-menu>
              </div>
              <div class="p-6 h-full">
                <app-essay-history></app-essay-history>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Change Password Modal -->
    <app-change-password-modal
      [visible]="showChangePassword()"
      (visibleChange)="showChangePassword.set($event)"
      (passwordChanged)="onPasswordChanged()"
    ></app-change-password-modal>

    <!-- Logout Confirmation Modal -->
    <app-logout-confirmation-modal
      [visible]="showLogout()"
      (visibleChange)="showLogout.set($event)"
      (loggedOut)="onLoggedOut()"
    ></app-logout-confirmation-modal>
  `,
  styles: [
    `
      /* Dashboard container layout */
      .dashboard-container {
        background-color: #0c0c0c;
      }

      /* Content area styling */
      .dashboard-welcome-container,
      .rewrite-model-container,
      .essay-model-container,
      .rewrite-history-container,
      .essay-history-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      /* Custom scrollbar for main content */
      .flex-1::-webkit-scrollbar {
        width: 8px;
      }

      .flex-1::-webkit-scrollbar-track {
        background: #1f2937;
      }

      .flex-1::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
      }

      .flex-1::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }

      /* Header styling */
      .dashboard-welcome-container .p-4,
      .rewrite-model-container .p-4,
      .essay-model-container .p-4,
      .rewrite-history-container .p-4,
      .essay-history-container .p-4 {
        background-color: #111827;
        border-bottom: 1px solid #374151;
      }

      /* Dashboard welcome page styling */
      .dashboard-welcome-container .flex {
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      }

      /* Chat bot container styling */
      .rewrite-model-container app-chat-bot {
        height: calc(100vh - 100px); /* Adjust based on header height */
        display: block;
      }

      /* Animation for welcome content */
      .dashboard-welcome-container .text-center {
        animation: fadeInUp 0.8s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class DashboardComponent {
  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly ContentType = ContentType;

  // Modal visibility signals
  showChangePassword = signal(false);
  showLogout = signal(false);

  showChangePasswordModal(): void {
    this.showChangePassword.set(true);
  }

  showLogoutConfirmation(): void {
    this.showLogout.set(true);
  }

  onPasswordChanged(): void {
    // Password changed successfully, modal close
    console.log("Password changed successfully");
  }

  onLoggedOut(): void {
    // User logged out successfully, modal close
    console.log("User logged out successfully");
  }
}
