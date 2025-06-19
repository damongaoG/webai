import { Component, OnInit, OnDestroy, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { SpinnerComponent } from "@/app/shared";

// Interface for chat history item
interface ChatHistoryItem {
  sessionId: string;
  content: string;
  updateTime: Date;
  messageCount?: number;
  isActive?: boolean;
}

@Component({
  selector: "app-chat-history",
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="chat-history-container h-full bg-gray-800 rounded-lg">
      <!-- Header -->
      <div class="history-header p-4 border-b border-gray-700">
        <h3 class="text-lg font-semibold text-white">Chat History</h3>
        <p class="text-sm text-gray-400 mt-1">Your conversation history</p>
      </div>

      <!-- History List -->
      <div
        class="history-list flex-1 overflow-y-auto p-4"
        (scroll)="onHistoryScroll($event)"
      >
        @if (chatHistory().length === 0 && !isLoading()) {
          <div class="empty-history text-center py-12">
            <div class="text-4xl mb-4">💬</div>
            <p class="text-gray-400">No chat history yet.</p>
            <p class="text-sm text-gray-500 mt-2">
              Start a conversation to see your history here
            </p>
          </div>
        }
        @for (history of chatHistory(); track history.sessionId) {
          <div
            class="history-item p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 hover:bg-gray-700"
            [class.active]="activeHistoryId() === history.sessionId"
            [class.bg-green-900]="activeHistoryId() === history.sessionId"
            [class.border-l-4]="activeHistoryId() === history.sessionId"
            [class.border-green-400]="activeHistoryId() === history.sessionId"
            (click)="loadChat(history)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div
                  class="history-title text-sm font-medium text-white truncate"
                  [class.text-green-400]="
                    activeHistoryId() === history.sessionId
                  "
                >
                  {{ truncateContent(history.content || "Untitled Chat") }}
                </div>
                <div class="history-time text-xs text-gray-400 mt-1">
                  {{ formatDate(history.updateTime) }}
                </div>
                @if (history.messageCount) {
                  <div class="message-count text-xs text-gray-500 mt-1">
                    {{ history.messageCount }} messages
                  </div>
                }
              </div>
              @if (activeHistoryId() === history.sessionId) {
                <div class="active-indicator">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              }
            </div>
          </div>
        }
        @if (isLoading()) {
          <div class="loading-more py-4 text-center">
            <app-spinner
              [simple]="true"
              text="Loading more..."
              size="small"
            ></app-spinner>
          </div>
        }
      </div>

      <!-- Actions -->
      <div class="history-actions p-4 border-t border-gray-700">
        <button
          type="button"
          class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          (click)="startNewChat()"
        >
          Start New Chat
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-history-container {
        display: flex;
        flex-direction: column;
        min-height: 400px;
      }

      .history-list {
        max-height: calc(100vh - 200px);
      }

      .history-item {
        border: 1px solid transparent;
      }

      .history-item:hover {
        border-color: rgba(75, 85, 99, 0.5);
      }

      .history-item.active {
        background-color: rgba(5, 167, 111, 0.1) !important;
        border-color: rgba(5, 167, 111, 0.3);
      }

      .history-title {
        line-height: 1.4;
      }

      .empty-history {
        color: #9ca3af;
      }

      /* Custom scrollbar */
      .history-list::-webkit-scrollbar {
        width: 6px;
      }

      .history-list::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 3px;
      }

      .history-list::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 3px;
      }

      .history-list::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `,
  ],
})
export class ChatHistoryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  private readonly _chatHistory = signal<ChatHistoryItem[]>([]);
  private readonly _activeHistoryId = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Public computed signals
  public readonly chatHistory = computed(() => this._chatHistory());
  public readonly activeHistoryId = computed(() => this._activeHistoryId());
  public readonly isLoading = computed(() => this._isLoading());

  ngOnInit(): void {
    this.loadChatHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private loadChatHistory(): void {
    this._isLoading.set(true);

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      const mockHistory: ChatHistoryItem[] = [
        {
          sessionId: "session-1",
          content: "Help me rewrite this essay about climate change",
          updateTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          messageCount: 12,
        },
        {
          sessionId: "session-2",
          content: "Can you improve the grammar in this paragraph?",
          updateTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          messageCount: 8,
        },
        {
          sessionId: "session-3",
          content: "Rewrite this business proposal to sound more professional",
          updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          messageCount: 15,
        },
      ];

      this._chatHistory.set(mockHistory);
      this._isLoading.set(false);
    }, 1000);
  }

  loadChat(history: ChatHistoryItem): void {
    this._activeHistoryId.set(history.sessionId);

    console.log("Loading chat session:", history.sessionId);
  }

  startNewChat(): void {
    this._activeHistoryId.set(null);

    console.log("Starting new chat session");
  }

  onHistoryScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100; // Load more when 100px from bottom

    if (
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - threshold
    ) {
      this.loadMoreHistory();
    }
  }

  private loadMoreHistory(): void {
    if (this._isLoading()) return;

    this._isLoading.set(true);

    // Simulate loading more items
    setTimeout(() => {
      const moreItems: ChatHistoryItem[] = [
        {
          sessionId: `session-${Date.now()}`,
          content: "Previous conversation...",
          updateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          messageCount: 5,
        },
      ];

      this._chatHistory.update((current) => [...current, ...moreItems]);
      this._isLoading.set(false);
    }, 1000);
  }

  truncateContent(content: string, maxLength: number = 50): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
