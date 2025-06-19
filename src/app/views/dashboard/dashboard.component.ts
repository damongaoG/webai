import { Component, signal, inject } from "@angular/core";
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

// Interface for user credits data
interface UserCredits {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  subscriptionPlan: string;
  nextResetDate: Date;
}

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
  ],
  template: `
    <div class="dashboard-container h-screen flex overflow-hidden bg-black">
      <!-- Sidebar -->
      <app-dashboard-sidebar></app-dashboard-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-auto">
        <!-- Content based on sidebar selection -->
        @switch (sidebarState.selectedContent()) {
          @case (ContentType.REWRITE_MODEL) {
            <div class="rewrite-model-container h-full bg-gray-900">
              <div class="p-4 border-b border-gray-700">
                <h1 class="text-2xl font-bold text-white">Rewrite Model</h1>
                <p class="text-gray-400 mt-1">
                  AI-powered text rewriting assistant
                </p>
              </div>
              <div class="h-full">
                <app-chat-bot></app-chat-bot>
              </div>
            </div>
          }
          @case (ContentType.ESSAY_MODEL) {
            <div class="essay-model-container h-full bg-gray-900">
              <div class="p-4 border-b border-gray-700">
                <h1 class="text-2xl font-bold text-white">Essay Model</h1>
                <p class="text-gray-400 mt-1">
                  Comprehensive essay writing assistance
                </p>
              </div>
              <div class="flex-1 overflow-hidden">
                <app-dashboard-content></app-dashboard-content>
              </div>
            </div>
          }
          @case (ContentType.REWRITE_HISTORY) {
            <div class="rewrite-history-container h-full bg-gray-900">
              <div class="p-4 border-b border-gray-700">
                <h1 class="text-2xl font-bold text-white">Rewrite History</h1>
                <p class="text-gray-400 mt-1">
                  Your rewrite conversation history
                </p>
              </div>
              <div class="p-6 h-full">
                <app-chat-history></app-chat-history>
              </div>
            </div>
          }
          @case (ContentType.ESSAY_HISTORY) {
            <div class="essay-history-container h-full bg-gray-900">
              <div class="p-4 border-b border-gray-700">
                <h1 class="text-2xl font-bold text-white">Essay History</h1>
                <p class="text-gray-400 mt-1">Your essay writing history</p>
              </div>
              <div class="p-6 h-full">
                <app-essay-history></app-essay-history>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      /* Dashboard container layout */
      .dashboard-container {
        background-color: #0c0c0c;
      }

      /* Content area styling */
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
      .rewrite-model-container .p-4,
      .essay-model-container .p-4,
      .rewrite-history-container .p-4,
      .essay-history-container .p-4 {
        background-color: #111827;
        border-bottom: 1px solid #374151;
      }

      /* Chat bot container styling */
      .rewrite-model-container app-chat-bot {
        height: calc(100vh - 100px); /* Adjust based on header height */
        display: block;
      }
    `,
  ],
})
export class DashboardComponent {
  protected readonly sidebarState = inject(SidebarStateService);

  protected readonly ContentType = ContentType;

  // Signal for reactive user credits data
  userCredits = signal<UserCredits>({
    totalCredits: 10000,
    usedCredits: 3750,
    remainingCredits: 6250,
    subscriptionPlan: "Professional",
    nextResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });
}
