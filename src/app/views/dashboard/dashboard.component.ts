import { Component, inject, signal, effect } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSidebarComponent } from "./components/sidebar/sidebar.component";
import {
  SidebarStateService,
  ContentType,
} from "../../services/sidebar-state.service";
import { ChatBotComponent } from "@components/rewrite-model/components/chat-bot/chat-bot.component";
import { DashboardContentComponent } from "./components/content/dashboard-content.component";
import { ChatHistoryComponent } from "@components/chat-history/chat-history.component";
import { EssayHistoryComponent } from "@components/essay-history/essay-history.component";
import { ChatStatusService } from "@components/rewrite-model/services/chat-status.service";
import { ChatBotService } from "@components/rewrite-model/services/chat-bot.service";
import { MessageService } from "../../shared";
import { switchMap, of, catchError } from "rxjs";
import {
  UserMenuComponent,
  ChangePasswordModalComponent,
  LogoutConfirmationModalComponent,
  EssayTitleModalComponent,
} from "../../shared";

// Interface for user credits data
@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DashboardSidebarComponent,
    ChatBotComponent,
    DashboardContentComponent,
    ChatHistoryComponent,
    EssayHistoryComponent,
    UserMenuComponent,
    ChangePasswordModalComponent,
    LogoutConfirmationModalComponent,
    EssayTitleModalComponent,
  ],
  template: `
    <div class="dashboard-container h-screen flex overflow-hidden bg-black">
      <!-- Sidebar - Only render when not collapsed -->
      @if (!sidebarState.isSidebarCollapsed()) {
        <app-dashboard-sidebar class="sidebar-transition">
        </app-dashboard-sidebar>
      }

      <!-- Main Content Area -->
      <div
        class="main-content-area flex-1 overflow-auto transition-all duration-300 ease-in-out"
        [class.expanded]="sidebarState.isSidebarCollapsed()"
      >
        <!-- Top Header with Toggle Button -->
        <div
          class="top-header p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900"
        >
          <div class="flex items-center">
            <!-- Sidebar Toggle Button -->
            <button
              (click)="toggleSidebar()"
              class="sidebar-toggle-btn p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-200 mr-4"
              [attr.aria-label]="
                sidebarState.isSidebarCollapsed()
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              "
            >
              <lucide-angular
                [name]="sidebarState.isSidebarCollapsed() ? 'menu' : 'x'"
                class="h-5 w-5"
              ></lucide-angular>
            </button>

            <!-- Page Title -->
            @switch (sidebarState.selectedContent()) {
              @case (ContentType.DASHBOARD) {
                <div>
                  <h1 class="text-2xl font-bold text-white">Dashboard</h1>
                  <p class="text-gray-400 mt-1">
                    Welcome to your AI-powered workspace
                  </p>
                </div>
              }
              @case (ContentType.REWRITE_MODEL) {
                <div>
                  <h1 class="text-2xl font-bold text-white">Rewrite Model</h1>
                  <p class="text-gray-400 mt-1">
                    AI-powered text rewriting assistant
                  </p>
                </div>
              }
              @case (ContentType.ESSAY_MODEL) {
                <div>
                  <h1 class="text-2xl font-bold text-white">Essay Model</h1>
                  <p class="text-gray-400 mt-1">
                    Comprehensive essay writing assistance
                  </p>
                </div>
              }
              @case (ContentType.REWRITE_HISTORY) {
                <div>
                  <h1 class="text-2xl font-bold text-white">Rewrite History</h1>
                  <p class="text-gray-400 mt-1">
                    Your rewrite conversation history
                  </p>
                </div>
              }
              @case (ContentType.ESSAY_HISTORY) {
                <div>
                  <h1 class="text-2xl font-bold text-white">Essay History</h1>
                  <p class="text-gray-400 mt-1">Your essay writing history</p>
                </div>
              }
              @case (ContentType.REWRITE_NEW) {
                <div>
                  <h1 class="text-2xl font-bold text-white">New Rewrite</h1>
                  <p class="text-gray-400 mt-1">
                    Start a new text rewriting session
                  </p>
                </div>
              }
              @case (ContentType.ESSAY_NEW) {
                <div>
                  <h1 class="text-2xl font-bold text-white">New Essay</h1>
                  <p class="text-gray-400 mt-1">
                    Create a new essay with AI assistance
                  </p>
                </div>
              }
            }
          </div>

          <!-- User Menu -->
          <app-user-menu
            (changePassword)="showChangePasswordModal()"
            (logout)="showLogoutConfirmation()"
          ></app-user-menu>
        </div>

        <!-- Content based on sidebar selection -->
        <div class="content-wrapper h-full overflow-auto">
          @switch (sidebarState.selectedContent()) {
            @case (ContentType.DASHBOARD) {
              <div class="dashboard-welcome-container h-full bg-gray-900">
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
                <div class="h-full">
                  <app-chat-bot></app-chat-bot>
                </div>
              </div>
            }
            @case (ContentType.ESSAY_MODEL) {
              <div class="essay-model-container h-full bg-gray-900">
                <div class="flex-1 overflow-hidden">
                  <app-dashboard-content></app-dashboard-content>
                </div>
              </div>
            }
            @case (ContentType.REWRITE_HISTORY) {
              <div class="rewrite-history-container h-full bg-gray-900">
                <div class="p-6 h-full">
                  <app-chat-history></app-chat-history>
                </div>
              </div>
            }
            @case (ContentType.ESSAY_HISTORY) {
              <div class="essay-history-container h-full bg-gray-900">
                <div class="p-6 h-full">
                  <app-essay-history></app-essay-history>
                </div>
              </div>
            }
            @case (ContentType.REWRITE_NEW) {
              <div class="rewrite-new-container h-full bg-gray-900">
                @if (isRewriteAvailable()) {
                  <div class="h-full">
                    <app-chat-bot></app-chat-bot>
                  </div>
                } @else {
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center max-w-md">
                      @if (isCheckingRewriteStatus()) {
                        <div class="mb-4">
                          <div
                            class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"
                          ></div>
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-2">
                          Checking Status...
                        </h3>
                        <p class="text-gray-400">
                          Please wait while we verify your account status.
                        </p>
                      } @else {
                        <div class="mb-6">
                          <div
                            class="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4"
                          >
                            <lucide-angular
                              name="circle-alert"
                              class="h-8 w-8 text-white"
                            ></lucide-angular>
                          </div>
                        </div>
                        <h3 class="text-xl font-semibold text-white mb-2">
                          Access Restricted
                        </h3>
                        <p class="text-gray-400 mb-6">
                          {{ getRewriteErrorMessage() }}
                        </p>
                        <button
                          class="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                          (click)="retryRewriteCheck()"
                        >
                          Try Again
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
            @case (ContentType.ESSAY_NEW) {
              <div class="essay-new-container h-full bg-gray-900">
                @if (essayTitle()) {
                  <div
                    class="flex-1 overflow-hidden"
                    style="width: 100%; height: 100%"
                  >
                    <app-dashboard-content></app-dashboard-content>
                  </div>
                } @else {
                  <div class="flex items-center justify-center h-full">
                    <div class="text-center max-w-md">
                      <div class="mb-6">
                        <div
                          class="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4"
                        >
                          <lucide-angular
                            name="file-text"
                            class="h-8 w-8 text-white"
                          ></lucide-angular>
                        </div>
                      </div>
                      <h3 class="text-xl font-semibold text-white mb-2">
                        Create New Essay
                      </h3>
                      <p class="text-gray-400 mb-6">
                        Start by entering a title for your new essay.
                      </p>
                      <button
                        class="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                        (click)="openEssayTitleModal()"
                      >
                        Enter Essay Title
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
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

    <!-- Essay Title Modal -->
    <app-essay-title-modal
      [visible]="showEssayTitleModal"
      (visibleChange)="showEssayTitleModal.set($event)"
      (titleConfirmed)="onEssayTitleConfirmed($event)"
      (cancelled)="onEssayTitleCancelled()"
    ></app-essay-title-modal>
  `,
  styles: [
    `
      /* Dashboard container layout */
      .dashboard-container {
        font-family: "Source Han Sans CN", sans-serif;
      }

      /* Sidebar transition effects */
      .sidebar-transition {
        transition: all 0.3s ease-in-out;
      }

      /* Main content area responsive behavior */
      .main-content-area {
        min-width: 0; /* Prevent flex item from growing beyond container */
      }

      .main-content-area.expanded {
        margin-left: 0;
      }

      /* Top header styling */
      .top-header {
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* Sidebar toggle button */
      .sidebar-toggle-btn {
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .sidebar-toggle-btn:hover {
        border-color: rgba(5, 167, 111, 0.3);
        box-shadow: 0 0 0 2px rgba(5, 167, 111, 0.1);
      }

      /* Content wrapper */
      .content-wrapper {
        height: calc(100vh - 80px); /* Subtract header height */
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .dashboard-container {
          flex-direction: column;
        }

        .sidebar-transition {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 50;
          height: 100vh;
        }

        .main-content-area {
          width: 100%;
        }
      }
    `,
  ],
})
export class DashboardComponent {
  protected readonly sidebarState = inject(SidebarStateService);
  protected readonly ContentType = ContentType;

  // Inject services
  private readonly chatStatusService = inject(ChatStatusService);
  private readonly chatBotService = inject(ChatBotService);
  private readonly messageService = inject(MessageService);

  private isFirstEffectExecution = true;

  // Modal state signals
  showChangePassword = signal(false);
  showLogout = signal(false);
  showEssayTitleModal = signal(false);

  // Essay and rewrite state
  essayTitle = signal<string | null>(null);
  rewriteStatus = signal<{
    isAvailable: boolean;
    isChecking: boolean;
    errorMessage: string | null;
  }>({
    isAvailable: false,
    isChecking: false,
    errorMessage: null,
  });

  constructor() {
    // React to sidebar state changes to handle new content types
    effect(
      () => {
        const content = this.sidebarState.selectedContent();
        const navContext = this.sidebarState.navigationContext();

        console.log(
          "Dashboard effect triggered - content:",
          content,
          "navContext:",
          navContext,
          "isFirst:",
          this.isFirstEffectExecution,
        );

        // Skip the first execution to avoid unnecessary checks on component initialization
        if (this.isFirstEffectExecution) {
          this.isFirstEffectExecution = false;
          return;
        }

        if (content === ContentType.REWRITE_NEW) {
          this.handleRewriteNewSelection(navContext);
        } else if (content === ContentType.ESSAY_NEW) {
          this.handleEssayNewSelection();
        }
      },
      { allowSignalWrites: true },
    );
  }

  // Toggle sidebar collapse/expand
  toggleSidebar(): void {
    this.sidebarState.toggleSidebarCollapse();
  }

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

  // Rewrite new content methods
  private handleRewriteNewSelection(navContext?: {
    fromHistory?: boolean;
    sessionId?: string;
  }): void {
    console.log("handleRewriteNewSelection called with context:", navContext);

    // If navigating from history, skip status check and set as available
    if (navContext?.fromHistory === true) {
      console.log("Navigation from history detected, skipping status check");

      this.rewriteStatus.set({
        isAvailable: true,
        isChecking: false,
        errorMessage: null,
      });

      // Clear navigation context after handling to prevent reuse
      setTimeout(() => {
        console.log("Clearing navigation context");
        this.sidebarState.clearNavigationContext();
      }, 500);
    } else {
      console.log("Normal navigation, checking rewrite status");
      // Check status
      this.checkRewriteStatus();
    }
  }

  private checkRewriteStatus(): void {
    this.rewriteStatus.set({
      isAvailable: false,
      isChecking: true,
      errorMessage: null,
    });

    this.chatStatusService
      .checkChatStatus()
      .pipe(
        switchMap((result) => {
          console.log("chat status:", result);
          // If code is 0, need to start chat first
          if (result.code === 0) {
            return this.chatBotService.startChat();
          }
          // Otherwise, return the result
          return of(result);
        }),
        catchError((error) => {
          console.error("Error in chat status flow:", error);
          this.updateRewriteStatus(
            false,
            false,
            "Failed to check status. Please try again.",
          );
          return of(null);
        }),
      )
      .subscribe({
        next: (result) => {
          if (result) {
            this.handleChatResult(result);
          }
        },
      });
  }

  // Handle the result
  private handleChatResult(result: any): void {
    const isAvailable = result.code === 1;
    let errorMessage: string | null = null;

    if (!isAvailable) {
      if (result.code === -11) {
        errorMessage =
          "Your account has no activation code, please contact us to purchase";
      } else if (result.code === -2) {
        errorMessage =
          "Your activation code has already been used on another device";
      } else {
        errorMessage = "Access denied. Please check your account status.";
      }
    }

    this.updateRewriteStatus(isAvailable, false, errorMessage);
  }

  // Update rewrite status helper method
  private updateRewriteStatus(
    isAvailable: boolean,
    isChecking: boolean,
    errorMessage: string | null,
  ): void {
    this.rewriteStatus.set({
      isAvailable,
      isChecking,
      errorMessage,
    });
  }

  isRewriteAvailable(): boolean {
    return this.rewriteStatus().isAvailable;
  }

  isCheckingRewriteStatus(): boolean {
    return this.rewriteStatus().isChecking;
  }

  getRewriteErrorMessage(): string {
    return this.rewriteStatus().errorMessage || "Access denied";
  }

  retryRewriteCheck(): void {
    this.checkRewriteStatus();
  }

  // Essay new content methods
  private handleEssayNewSelection(): void {
    // Reset essay title when first entering essay new
    if (!this.essayTitle()) {
      this.essayTitle.set(null);
    }
  }

  openEssayTitleModal(): void {
    this.showEssayTitleModal.set(true);
  }

  onEssayTitleConfirmed(title: string): void {
    this.essayTitle.set(title);
    this.showEssayTitleModal.set(false);
    this.messageService.success(`Essay "${title}" created successfully!`);
  }

  onEssayTitleCancelled(): void {
    this.showEssayTitleModal.set(false);
  }
}
