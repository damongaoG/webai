import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { SpinnerComponent } from "@/app/shared";
import {
  EssayFolder,
  EssayHistoryItem,
  BreadcrumbItem,
  ViewMode,
  DragDropEvent,
} from "@/app/interfaces/essay-folder.interface";

@Component({
  selector: "app-essay-history",
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, SpinnerComponent],
  template: `
    <div class="essay-history-container h-full bg-gray-800 rounded-lg">
      <!-- Header with view controls -->
      <div class="history-header p-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-white">Essay History</h3>
            <p class="text-sm text-gray-400 mt-1">
              Your essay writing progress
            </p>
          </div>

          <!-- View mode toggle -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 rounded-md transition-colors duration-200"
              [class.bg-green-600]="viewMode() === 'folder'"
              [class.text-white]="viewMode() === 'folder'"
              [class.text-gray-400]="viewMode() !== 'folder'"
              [class.hover:bg-gray-700]="viewMode() !== 'folder'"
              (click)="setViewMode('folder')"
              title="Folder View"
            >
              <i class="mdi mdi-folder text-lg"></i>
            </button>
            <button
              type="button"
              class="p-2 rounded-md transition-colors duration-200"
              [class.bg-green-600]="viewMode() === 'list'"
              [class.text-white]="viewMode() === 'list'"
              [class.text-gray-400]="viewMode() !== 'list'"
              [class.hover:bg-gray-700]="viewMode() !== 'list'"
              (click)="setViewMode('list')"
              title="List View"
            >
              <i class="mdi mdi-view-list text-lg"></i>
            </button>
          </div>
        </div>

        <!-- Breadcrumb navigation -->
        @if (breadcrumbs().length > 0) {
          <nav class="flex items-center gap-2 mt-3 text-sm">
            @for (
              breadcrumb of breadcrumbs();
              track breadcrumb.id;
              let isLast = $last
            ) {
              <button
                type="button"
                class="text-gray-300 hover:text-white transition-colors"
                [class.text-green-400]="breadcrumb.isActive"
                [class.font-medium]="breadcrumb.isActive"
                (click)="navigateToFolder(breadcrumb.id)"
              >
                {{ breadcrumb.name }}
              </button>
              @if (!isLast) {
                <i class="mdi mdi-chevron-right text-gray-500"></i>
              }
            }
          </nav>
        }
      </div>

      <!-- History content -->
      <div
        class="history-content flex-1 overflow-y-auto p-4"
        (scroll)="onHistoryScroll($event)"
      >
        <!-- Folder view -->
        @if (viewMode() === "folder") {
          <!-- Current folder contents -->
          <div class="space-y-4">
            <!-- Folders in current directory -->
            @if (currentFolders().length > 0) {
              <div class="folders-section">
                <h4 class="text-sm font-medium text-gray-400 mb-3">Folders</h4>
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
                >
                  @for (folder of currentFolders(); track folder.id) {
                    <div
                      class="folder-item p-3 bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-600"
                      (click)="openFolder(folder.id)"
                      (contextmenu)="onFolderContextMenu($event, folder)"
                      cdkDropList
                      [cdkDropListData]="folder.id"
                      (cdkDropListDropped)="onFolderDrop($event, folder.id)"
                    >
                      <div class="flex flex-col items-center text-center">
                        <i
                          class="mdi mdi-folder text-2xl text-yellow-500 mb-2"
                        ></i>
                        <span
                          class="text-sm text-white font-medium truncate w-full"
                        >
                          {{ folder.name }}
                        </span>
                        <span class="text-xs text-gray-400 mt-1">
                          {{ folder.essayCount }} essays
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Essays in current folder -->
            @if (currentEssays().length > 0) {
              <div class="essays-section">
                <h4 class="text-sm font-medium text-gray-400 mb-3">Essays</h4>
                <div
                  class="essays-grid"
                  cdkDropList
                  [cdkDropListData]="currentFolderId()"
                  (cdkDropListDropped)="onEssayDrop($event)"
                >
                  @for (essay of currentEssays(); track essay.id) {
                    <div
                      class="essay-card p-4 bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-600"
                      [class.active]="activeEssayId() === essay.id"
                      [class.bg-green-900]="activeEssayId() === essay.id"
                      [class.border-l-4]="activeEssayId() === essay.id"
                      [class.border-green-400]="activeEssayId() === essay.id"
                      cdkDrag
                      [cdkDragData]="essay"
                      (click)="loadEssay(essay)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <div
                            class="essay-title text-sm font-semibold text-white mb-1 truncate"
                          >
                            {{ essay.title }}
                          </div>
                          <div
                            class="essay-topic text-xs text-blue-400 mb-2 truncate"
                          >
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
                              [class.bg-green-900]="
                                essay.status === 'completed'
                              "
                              [class.text-green-300]="
                                essay.status === 'completed'
                              "
                              [class.bg-blue-900]="
                                essay.status === 'in-progress'
                              "
                              [class.text-blue-300]="
                                essay.status === 'in-progress'
                              "
                            >
                              {{ getStatusText(essay.status) }}
                            </div>
                          </div>
                        </div>
                        @if (activeEssayId() === essay.id) {
                          <div class="active-indicator ml-3">
                            <div
                              class="w-2 h-2 bg-green-400 rounded-full"
                            ></div>
                          </div>
                        }
                      </div>

                      <!-- Drag handle -->
                      <div
                        class="drag-handle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i class="mdi mdi-drag text-gray-400"></i>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Empty state -->
            @if (
              currentFolders().length === 0 &&
              currentEssays().length === 0 &&
              !isLoading()
            ) {
              <div class="empty-state text-center py-12">
                <div class="text-4xl mb-4">📁</div>
                <p class="text-gray-400">This folder is empty.</p>
                <p class="text-sm text-gray-500 mt-2">
                  Drag essays here or create new folders
                </p>
              </div>
            }
          </div>
        }

        <!-- List view -->
        @if (viewMode() === "list") {
          @if (essayHistory().length === 0 && !isLoading()) {
            <div class="empty-history text-center py-12">
              <div class="text-4xl mb-4">📝</div>
              <p class="text-gray-400">No essays yet.</p>
              <p class="text-sm text-gray-500 mt-2">
                Start writing to see your essays here
              </p>
            </div>
          }

          <div cdkDropList (cdkDropListDropped)="onEssayDrop($event)">
            @for (essay of essayHistory(); track essay.id) {
              <div
                class="history-item group p-4 rounded-lg cursor-pointer transition-all duration-200 mb-3 hover:bg-gray-700"
                [class.active]="activeEssayId() === essay.id"
                [class.bg-green-900]="activeEssayId() === essay.id"
                [class.border-l-4]="activeEssayId() === essay.id"
                [class.border-green-400]="activeEssayId() === essay.id"
                cdkDrag
                [cdkDragData]="essay"
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
                    @if (essay.folderId) {
                      <div class="folder-info text-xs text-purple-400 mb-2">
                        <i class="mdi mdi-folder-outline mr-1"></i>
                        {{ getFolderName(essay.folderId) }}
                      </div>
                    }
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

                  <div class="flex items-center gap-2">
                    @if (activeEssayId() === essay.id) {
                      <div class="active-indicator">
                        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                    }
                    <!-- Drag handle -->
                    <div
                      class="drag-handle opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i class="mdi mdi-drag text-gray-400"></i>
                    </div>
                  </div>
                </div>
              </div>
            }
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
        <div class="flex gap-2">
          @if (viewMode() === "folder") {
            <button
              type="button"
              class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              (click)="showCreateFolderDialog()"
            >
              <i class="mdi mdi-folder-plus mr-2"></i>
              New Folder
            </button>
          }
          <button
            type="button"
            class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            (click)="startNewEssay()"
          >
            <i class="mdi mdi-plus mr-2"></i>
            New Essay
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Rename Folder Modal -->
    @if (showFolderModal()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="closeFolderModal()"
      >
        <div
          class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-700"
          >
            <h3 class="text-lg font-semibold text-white">
              {{
                folderModalMode() === "create"
                  ? "Create New Folder"
                  : "Rename Folder"
              }}
            </h3>
            <button
              type="button"
              class="text-gray-400 hover:text-white transition-colors"
              (click)="closeFolderModal()"
            >
              <i class="mdi mdi-close text-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <div class="mb-4">
              <label
                for="folderName"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Folder Name
              </label>
              <input
                #folderNameInput
                id="folderName"
                type="text"
                [(ngModel)]="folderNameValue"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-green-500"
                placeholder="Enter folder name..."
                (keyup.enter)="confirmFolderAction()"
                (keyup.escape)="closeFolderModal()"
                maxlength="50"
              />
              @if (folderNameError()) {
                <p class="mt-2 text-sm text-red-400">{{ folderNameError() }}</p>
              }
            </div>
            <div class="text-right text-xs text-gray-400">
              {{ folderNameValue.length }}/50
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              (click)="closeFolderModal()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="!isValidFolderName()"
              (click)="confirmFolderAction()"
            >
              {{ folderModalMode() === "create" ? "Create" : "Rename" }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .essay-history-container {
        display: flex;
        flex-direction: column;
        min-height: 400px;
      }

      .history-content {
        max-height: calc(100vh - 200px);
      }

      .essays-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .essay-card {
        position: relative;
        border: 1px solid transparent;
      }

      .essay-card:hover {
        border-color: rgba(75, 85, 99, 0.5);
      }

      .essay-card.active {
        background-color: rgba(5, 167, 111, 0.1) !important;
        border-color: rgba(5, 167, 111, 0.3);
      }

      .history-item {
        border: 1px solid transparent;
        position: relative;
      }

      .history-item:hover {
        border-color: rgba(75, 85, 99, 0.5);
      }

      .history-item.active {
        background-color: rgba(5, 167, 111, 0.1) !important;
        border-color: rgba(5, 167, 111, 0.3);
      }

      .folder-item {
        min-height: 100px;
        border: 2px dashed transparent;
        transition: all 0.2s ease;
      }

      .folder-item:hover {
        border-color: rgba(75, 85, 99, 0.5);
      }

      .folder-item.cdk-drop-list-dragging {
        border-color: #10b981;
        background-color: rgba(16, 185, 129, 0.1);
      }

      .drag-handle {
        cursor: move;
      }

      .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        background: #374151;
        color: white;
        padding: 1rem;
        max-width: 300px;
      }

      .cdk-drag-placeholder {
        opacity: 0.5;
        background: #4b5563;
        border: 2px dashed #6b7280;
      }

      .cdk-drop-list-dragging .cdk-drag {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .status-badge {
        font-size: 10px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }

      .empty-state,
      .empty-history {
        color: #9ca3af;
      }

      /* Custom scrollbar */
      .history-content::-webkit-scrollbar {
        width: 6px;
      }

      .history-content::-webkit-scrollbar-track {
        background: #374151;
        border-radius: 3px;
      }

      .history-content::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 3px;
      }

      .history-content::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `,
  ],
})
export class EssayHistoryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  // Signals for reactive state management
  private readonly _essayHistory = signal<EssayHistoryItem[]>([]);
  private readonly _folders = signal<EssayFolder[]>([]);
  private readonly _activeEssayId = signal<string | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _viewMode = signal<ViewMode>("folder");
  private readonly _currentFolderId = signal<string | null>(null);
  private readonly _breadcrumbs = signal<BreadcrumbItem[]>([
    { id: "root", name: "Essays", isActive: true },
  ]);

  // Folder modal signals
  private readonly _showFolderModal = signal<boolean>(false);
  private readonly _folderModalMode = signal<"create" | "rename">("create");
  private readonly _folderNameValue = signal<string>("");
  private readonly _folderNameError = signal<string>("");
  private readonly _editingFolderId = signal<string | null>(null);

  // Public computed signals
  public readonly essayHistory = computed(() => this._essayHistory());
  public readonly folders = computed(() => this._folders());
  public readonly activeEssayId = computed(() => this._activeEssayId());
  public readonly isLoading = computed(() => this._isLoading());
  public readonly viewMode = computed(() => this._viewMode());
  public readonly currentFolderId = computed(() => this._currentFolderId());
  public readonly breadcrumbs = computed(() => this._breadcrumbs());
  public readonly showFolderModal = computed(() => this._showFolderModal());
  public readonly folderModalMode = computed(() => this._folderModalMode());
  public readonly folderNameError = computed(() => this._folderNameError());

  // Computed for current view data
  public readonly currentFolders = computed(() => {
    const currentId = this._currentFolderId();
    return this._folders().filter((folder) => folder.parentId === currentId);
  });

  public readonly currentEssays = computed(() => {
    const currentId = this._currentFolderId();
    return this._essayHistory().filter((essay) => essay.folderId === currentId);
  });

  // Folder name input value
  get folderNameValue(): string {
    return this._folderNameValue();
  }

  set folderNameValue(value: string) {
    this._folderNameValue.set(value);
    this._folderNameError.set(""); // Clear error when typing
  }

  ngOnInit(): void {
    this.loadEssayHistory();
    this.loadFolders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // View mode methods
  setViewMode(mode: ViewMode): void {
    this._viewMode.set(mode);
  }

  // Navigation methods
  navigateToFolder(folderId: string): void {
    if (folderId === "root") {
      this._currentFolderId.set(null);
      this._breadcrumbs.set([{ id: "root", name: "Essays", isActive: true }]);
    } else {
      this._currentFolderId.set(folderId);
      this.updateBreadcrumbs(folderId);
    }
  }

  openFolder(folderId: string): void {
    this._currentFolderId.set(folderId);
    this.updateBreadcrumbs(folderId);
  }

  private updateBreadcrumbs(folderId: string): void {
    const breadcrumbs: BreadcrumbItem[] = [
      { id: "root", name: "Essays", isActive: false },
    ];

    // Build breadcrumb trail
    let currentId: string | null = folderId;
    const trail: EssayFolder[] = [];

    while (currentId) {
      const folder = this._folders().find((f) => f.id === currentId);
      if (folder) {
        trail.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    trail.forEach((folder, index) => {
      breadcrumbs.push({
        id: folder.id,
        name: folder.name,
        isActive: index === trail.length - 1,
      });
    });

    this._breadcrumbs.set(breadcrumbs);
  }

  // Folder management methods
  showCreateFolderDialog(): void {
    this._folderModalMode.set("create");
    this._folderNameValue.set("");
    this._folderNameError.set("");
    this._showFolderModal.set(true);

    // Focus input after modal opens
    setTimeout(() => {
      const input = document.getElementById("folderName") as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  closeFolderModal(): void {
    this._showFolderModal.set(false);
    this._folderNameValue.set("");
    this._folderNameError.set("");
    this._editingFolderId.set(null);
  }

  isValidFolderName(): boolean {
    const name = this._folderNameValue().trim();
    if (name.length === 0) return false;

    // Check for duplicate names in current directory
    const currentId = this._currentFolderId();
    const existingNames = this._folders()
      .filter(
        (f) => f.parentId === currentId && f.id !== this._editingFolderId(),
      )
      .map((f) => f.name.toLowerCase());

    return !existingNames.includes(name.toLowerCase());
  }

  confirmFolderAction(): void {
    if (!this.isValidFolderName()) {
      this._folderNameError.set("Invalid folder name or name already exists");
      return;
    }

    const name = this._folderNameValue().trim();

    if (this._folderModalMode() === "create") {
      this.createFolder(name);
    } else {
      this.renameFolder(this._editingFolderId()!, name);
    }

    this.closeFolderModal();
  }

  private createFolder(name: string): void {
    const newFolder: EssayFolder = {
      id: `folder-${Date.now()}`,
      name: name,
      parentId: this._currentFolderId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      essayCount: 0,
    };

    this._folders.update((folders) => [...folders, newFolder]);
    console.log("Created folder:", newFolder);
  }

  private renameFolder(folderId: string, newName: string): void {
    this._folders.update((folders) =>
      folders.map((folder) =>
        folder.id === folderId
          ? { ...folder, name: newName, updatedAt: new Date() }
          : folder,
      ),
    );

    // Update breadcrumbs if current folder was renamed
    if (folderId === this._currentFolderId()) {
      this.updateBreadcrumbs(folderId);
    }

    console.log("Renamed folder:", folderId, "to:", newName);
  }

  // Context menu for folders
  onFolderContextMenu(event: MouseEvent, folder: EssayFolder): void {
    event.preventDefault();
    console.log("Context menu for folder:", folder);
  }

  // Drag and drop methods
  onFolderDrop(event: CdkDragDrop<any>, targetFolderId: string): void {
    if (event.previousContainer !== event.container) {
      const essay = event.item.data as EssayHistoryItem;
      this.moveEssayToFolder(essay.id, targetFolderId);
    }
  }

  onEssayDrop(event: CdkDragDrop<any>): void {
    const essay = event.item.data as EssayHistoryItem;
    const targetFolderId = this._currentFolderId();

    if (essay.folderId !== targetFolderId) {
      this.moveEssayToFolder(essay.id, targetFolderId);
    }
  }

  private moveEssayToFolder(
    essayId: string,
    targetFolderId: string | null,
  ): void {
    const essay = this._essayHistory().find((e) => e.id === essayId);
    if (!essay) return;

    const previousFolderId = essay.folderId;

    // Update essay folder assignment
    this._essayHistory.update((essays) =>
      essays.map((e) =>
        e.id === essayId ? { ...e, folderId: targetFolderId } : e,
      ),
    );

    // Update folder essay counts
    this.updateFolderCounts(previousFolderId, targetFolderId);

    console.log(
      "Moved essay",
      essayId,
      "from",
      previousFolderId,
      "to",
      targetFolderId,
    );
  }

  private updateFolderCounts(
    fromFolderId: string | null,
    toFolderId: string | null,
  ): void {
    this._folders.update((folders) =>
      folders.map((folder) => {
        if (folder.id === fromFolderId && folder.essayCount > 0) {
          return { ...folder, essayCount: folder.essayCount - 1 };
        }
        if (folder.id === toFolderId) {
          return { ...folder, essayCount: folder.essayCount + 1 };
        }
        return folder;
      }),
    );
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
          folderId: null,
        },
        {
          id: "essay-2",
          title: "Artificial Intelligence in Modern Healthcare",
          topic: "Technology & Medicine",
          wordCount: 800,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          status: "draft",
          folderId: "folder-1",
        },
        {
          id: "essay-3",
          title: "The Evolution of Social Media Marketing",
          topic: "Business & Marketing",
          wordCount: 1500,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          status: "completed",
          folderId: "folder-1",
        },
        {
          id: "essay-4",
          title: "Renewable Energy Solutions for Developing Countries",
          topic: "Environmental Policy",
          wordCount: 950,
          lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
          status: "completed",
          folderId: null,
        },
      ];

      this._essayHistory.set(mockHistory);
      this._isLoading.set(false);
    }, 1000);
  }

  private loadFolders(): void {
    // Simulate loading folders
    setTimeout(() => {
      const mockFolders: EssayFolder[] = [
        {
          id: "folder-1",
          name: "Academic Research",
          parentId: null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          essayCount: 2,
        },
        {
          id: "folder-2",
          name: "Personal Projects",
          parentId: null,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          essayCount: 0,
        },
      ];

      this._folders.set(mockFolders);
    }, 500);
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
          folderId: null,
        },
      ];

      this._essayHistory.update((current) => [...current, ...moreItems]);
      this._isLoading.set(false);
    }, 1000);
  }

  // Utility methods
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

  getFolderName(folderId: string): string {
    const folder = this._folders().find((f) => f.id === folderId);
    return folder ? folder.name : "Unknown Folder";
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
