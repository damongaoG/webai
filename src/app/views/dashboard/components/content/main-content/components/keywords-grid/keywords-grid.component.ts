import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  KeywordData,
  KeywordsGridConfig,
} from "../../interfaces/keyword.interface";
import { UnifiedGridConfig } from "../../interfaces/grid.interface";
import { UnifiedGridComponent } from "../unified-grid/unified-grid.component";

/**
 * Keywords grid component that displays keywords using the unified grid
 * Provides consistent UI and behavior with arguments grid
 */
@Component({
  selector: "app-keywords-grid",
  standalone: true,
  imports: [CommonModule, UnifiedGridComponent],
  template: `
    <app-unified-grid
      [items]="keywords"
      [gridConfig]="unifiedGridConfig"
      [isSelectable]="true"
      (itemSelected)="onKeywordSelected($event)"
      (itemDeselected)="onKeywordDeselected($event)"
    />
  `,
  styleUrl: "./keywords-grid.component.scss",
})
export class KeywordsGridComponent {
  @Input() keywords: KeywordData[] = [];
  @Input() gridConfig: KeywordsGridConfig = {
    gap: 16,
    animationDuration: 300,
  };

  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();

  /**
   * Convert legacy grid config to unified grid config
   */
  get unifiedGridConfig(): UnifiedGridConfig {
    return {
      columns: 3, // Default to 3 columns for keywords
      gap: this.gridConfig.gap,
      animationDuration: this.gridConfig.animationDuration,
      showEmptyState: true,
      emptyStateMessage: "No available keywords",
      emptyStateSubMessage: "Keywords will appear here once they are generated",
    };
  }

  /**
   * Handle keyword selection
   */
  onKeywordSelected(keyword: KeywordData): void {
    console.log("Keyword selected:", keyword);
    this.keywordSelected.emit(keyword);
  }

  /**
   * Handle keyword deselection
   */
  onKeywordDeselected(keyword: KeywordData): void {
    console.log("Keyword deselected:", keyword);
    this.keywordDeselected.emit(keyword);
  }
}
