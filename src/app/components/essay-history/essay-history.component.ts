import { Component, OnInit, OnDestroy, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject } from "rxjs";
import { SpinnerComponent } from "@/app/shared";

// Interface for essay history item
interface EssayHistoryItem {
  id: string;
  title: string;
  topic: string;
  wordCount: number;
  lastModified: Date;
  status: "draft" | "completed" | "in-progress";
  isActive?: boolean;
}

@Component({
  selector: "app-essay-history",
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="essay-history-container h-full bg-gray-800 rounded-lg">
      <!-- Header -->
      <div class="history-header p-4 border-b border-gray-700">
        <h3 class="text-lg font-semibold text-white">Essay History</h3>
        <p class="text-sm text-gray-400 mt-1">Your essay writing progress</p>
      </div>

      <!-- History List -->
      <div
        class="history-list flex-1 overflow-y-auto p-4"
        (scroll)="onHistoryScroll($event)"
      >
        @if (essayHistory().length === 0 && !isLoading()) {
          <div class="empty-history text-center py-12">
            <div class="text-4xl mb-4">📝</div>
            <p class="text-gray-400">No essays yet.</p>
            <p class="text-sm text-gray-500 mt-2">
              Start writing to see your essays here
            </p>
          </div>
        }
        @for (essay of essayHistory(); track essay.id) {
          <div
            class="history-item p-4 rounded-lg cursor-pointer transition-all duration-200 mb-3 hover:bg-gray-700"
            [class.active]="activeEssayId() === essay.id"
            [class.bg-green-900]="activeEssayId() === essay.id"
            [class.border-l-4]="activeEssayId() === essay.id"
            [class.border-green-400]="activeEssayId() === essay.id"
            (click)="loadEssay(essay)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div
                  class="essay-title text-sm font-semibold text-white mb-1"
                  [class.text-green-400]="activeEssayId() === essay.id"
                >
                  {{ essay.title }}
                </div>
                <div class="essay-topic text-xs text-blue-400 mb-2">
                  Topic: {{ essay.topic }}
                </div>
                <div class="flex items-center justify-between">
                  <div class="essay-meta text-xs text-gray-400">
                    {{ essay.wordCount }} words ·
                    {{ formatDate(essay.lastModified) }}
                  </div>
                  <div
                    class="status-badge px-2 py-1 rounded-full text-xs font-medium"
                    [class.bg-yellow-900]="essay.status === 'draft'"
                    [class.text-yellow-300]="essay.status === 'draft'"
                    [class.bg-green-900]="essay.status === 'completed'"
                    [class.text-green-300]="essay.status === 'completed'"
                    [class.bg-blue-900]="essay.status === 'in-progress'"
                    [class.text-blue-300]="essay.status === 'in-progress'"
                  >
                    {{ getStatusText(essay.status) }}
                  </div>
                </div>
              </div>
              @if (activeEssayId() === essay.id) {
                <div class="active-indicator ml-3">
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
          (click)="startNewEssay()"
        >
          Start New Essay
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .essay-history-container {
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

      .essay-title {
        line-height: 1.4;
      }

      .status-badge {
        font-size: 10px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
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
export class EssayHistoryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  private readonly _essayHistory = signal<EssayHistoryItem[]>([]);
  private readonly _activeEssayId = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);

  // Public computed signals
  public readonly essayHistory = computed(() => this._essayHistory());
  public readonly activeEssayId = computed(() => this._activeEssayId());
  public readonly isLoading = computed(() => this._isLoading());

  ngOnInit(): void {
    this.loadEssayHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEssayHistory(): void {
    this._isLoading.set(true);

    // Simulate API call - replace with actual service call
    setTimeout(() => {
      const mockHistory: EssayHistoryItem[] = [
        {
          id: "essay-1",
          title: "The Impact of Climate Change on Global Economics",
          topic: "Environmental Science",
          wordCount: 1200,
          lastModified: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
          status: "in-progress",
        },
        {
          id: "essay-2",
          title: "Artificial Intelligence in Modern Healthcare",
          topic: "Technology & Medicine",
          wordCount: 800,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          status: "draft",
        },
        {
          id: "essay-3",
          title: "The Evolution of Social Media Marketing",
          topic: "Business & Marketing",
          wordCount: 1500,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          status: "completed",
        },
        {
          id: "essay-4",
          title: "Renewable Energy Solutions for Developing Countries",
          topic: "Environmental Policy",
          wordCount: 950,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          status: "completed",
        },
      ];

      this._essayHistory.set(mockHistory);
      this._isLoading.set(false);
    }, 1000);
  }

  loadEssay(essay: EssayHistoryItem): void {
    this._activeEssayId.set(essay.id);

    console.log("Loading essay:", essay.id, essay.title);
  }

  startNewEssay(): void {
    this._activeEssayId.set(null);

    console.log("Starting new essay");
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
      const moreItems: EssayHistoryItem[] = [
        {
          id: `essay-${Date.now()}`,
          title: "Historical Essay Topic",
          topic: "History",
          wordCount: 600,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
          status: "draft",
        },
      ];

      this._essayHistory.update((current) => [...current, ...moreItems]);
      this._isLoading.set(false);
    }, 1000);
  }

  getStatusText(status: EssayHistoryItem["status"]): string {
    switch (status) {
      case "draft":
        return "Draft";
      case "completed":
        return "Complete";
      case "in-progress":
        return "Writing";
      default:
        return status;
    }
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
