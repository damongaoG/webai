import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * Generic grid item interface that both keywords and arguments can implement
 */
export interface GridItem {
  id: string;
  text: string;
  isSelected?: boolean;
}

/**
 * Configuration for the unified grid component
 */
export interface UnifiedGridConfig {
  columns: number;
  gap: number;
  animationDuration: number;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

/**
 * Unified grid component that can display any type of selectable items
 * Provides consistent UI and behavior for both keywords and arguments
 */
@Component({
  selector: "app-unified-grid",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="unified-grid-container">
      @if (items.length > 0) {
        <div class="grid-toolbar">
          <label
            class="select-all flex items-center gap-2 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              [checked]="areAllSelected"
              [indeterminate]="isPartiallySelected"
              (change)="onToggleSelectAll($event)"
              [disabled]="!isSelectable"
            />
            <span>Select all</span>
            <span class="opacity-70"
              >({{ selectedCount }}/{{ items.length }})</span
            >
          </label>
        </div>
        <div
          class="unified-grid"
          [style.grid-template-columns]="gridTemplateColumns()"
          [style.gap.px]="gridConfig.gap"
        >
          @for (item of items; track item.id) {
            <div
              class="grid-item"
              [class.selected]="isSelected(item.id)"
              [class.selectable]="isSelectable"
              (click)="onItemClick(item)"
              [style.animation-delay.ms]="getAnimationDelay($index)"
            >
              <div class="item-content">
                <div class="item-text">{{ item.text }}</div>
              </div>
            </div>
          }
        </div>
      } @else if (gridConfig.showEmptyState !== false) {
        <div class="empty-state">
          <div class="flex flex-col items-center justify-center py-8 px-4">
            <svg
              class="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p class="text-gray-500 text-sm font-medium">
              {{ gridConfig.emptyStateMessage || "No items available" }}
            </p>
            <p class="text-gray-400 text-xs mt-1">
              {{
                gridConfig.emptyStateSubMessage ||
                  "Items will appear here once they are generated"
              }}
            </p>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: "./unified-grid.component.scss",
})
export class UnifiedGridComponent<T extends GridItem> implements OnChanges {
  @Input() items: T[] = [];
  @Input() gridConfig: UnifiedGridConfig = {
    columns: 3,
    gap: 16,
    animationDuration: 300,
    showEmptyState: true,
  };
  @Input() isSelectable: boolean = true;

  @Output() itemSelected = new EventEmitter<T>();
  @Output() itemDeselected = new EventEmitter<T>();
  @Output() selectionChange = new EventEmitter<ReadonlySet<string>>();

  // Signal to track selected items
  private readonly selectedItems = signal<Set<string>>(new Set());

  // Computed property for grid template columns
  gridTemplateColumns = computed(
    () => `repeat(${this.gridConfig.columns}, 1fr)`,
  );

  /**
   * Check if an item is selected
   */
  isSelected(itemId: string): boolean {
    return this.selectedItems().has(itemId);
  }

  /**
   * Derived selection state (evaluated each CD cycle for accuracy with non-signal inputs)
   */
  get selectedCount(): number {
    return this.selectedItems().size;
  }

  get areAllSelected(): boolean {
    const total = this.items.length;
    return total > 0 && this.selectedItems().size === total;
  }

  get isPartiallySelected(): boolean {
    const size = this.selectedItems().size;
    const total = this.items.length;
    return size > 0 && size < total;
  }

  /**
   * Keep selection in sync when items input changes (removes ids not present anymore)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["items"]) {
      const validIds = new Set(this.items.map((i) => i.id));
      const current = this.selectedItems();
      let modified = false;
      const next = new Set<string>();
      current.forEach((id) => {
        if (validIds.has(id)) next.add(id);
        else modified = true;
      });
      if (modified) {
        this.selectedItems.set(next);
        this.emitSelectionChange();
      }
    }
  }

  /**
   * Handle item click
   */
  onItemClick(item: T): void {
    if (!this.isSelectable) return;

    if (this.isSelected(item.id)) {
      // Deselect item
      const newSelected = new Set(this.selectedItems());
      newSelected.delete(item.id);
      this.selectedItems.set(newSelected);
      this.itemDeselected.emit(item);
    } else {
      // Select item
      const newSelected = new Set(this.selectedItems());
      newSelected.add(item.id);
      this.selectedItems.set(newSelected);
      this.itemSelected.emit(item);
    }
    this.emitSelectionChange();
  }

  /**
   * Toggle select all checkbox
   */
  onToggleSelectAll(event: Event): void {
    event.stopPropagation();
    this.toggleSelectAll();
  }

  /**
   * Select all items
   */
  selectAll(): void {
    if (!this.isSelectable) return;

    // Capture previous selection to emit per-item selection events only for newly selected items
    const previouslySelected = new Set(this.selectedItems());

    const allIds = new Set(this.items.map((i) => i.id));
    this.selectedItems.set(allIds);

    // Emit itemSelected for items that were not previously selected
    for (const item of this.items) {
      if (!previouslySelected.has(item.id)) {
        this.itemSelected.emit(item);
      }
    }

    this.emitSelectionChange();
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    const prev = this.selectedItems();
    if (prev.size === 0) return;

    // Emit itemDeselected for previously selected items that still exist in current items
    const validIds = new Set(this.items.map((i) => i.id));
    for (const selectedId of prev) {
      if (!validIds.has(selectedId)) continue;
      const item = this.items.find((i) => i.id === selectedId);
      if (item) {
        this.itemDeselected.emit(item);
      }
    }

    this.selectedItems.set(new Set());
    this.emitSelectionChange();
  }

  /**
   * Toggle selection state between all selected and none selected
   */
  toggleSelectAll(): void {
    if (this.areAllSelected) this.clearSelection();
    else this.selectAll();
  }

  /**
   * Emit a stable snapshot of current selection
   */
  private emitSelectionChange(): void {
    this.selectionChange.emit(new Set(this.selectedItems()));
  }

  /**
   * Get animation delay for staggered animation
   */
  getAnimationDelay(index: number): number {
    return (index % this.gridConfig.columns) * 50;
  }
}
