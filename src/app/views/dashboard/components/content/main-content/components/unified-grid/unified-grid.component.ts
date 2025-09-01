import {
  Component,
  Input,
  Output,
  EventEmitter,
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
export class UnifiedGridComponent<T extends GridItem> {
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
  }

  /**
   * Get animation delay for staggered animation
   */
  getAnimationDelay(index: number): number {
    return (index % this.gridConfig.columns) * 50;
  }
}
