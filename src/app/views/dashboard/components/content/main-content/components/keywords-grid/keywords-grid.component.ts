import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  KeywordData,
  KeywordsGridConfig,
} from "../../interfaces/keyword.interface";
import { KeywordTagComponent } from "../keyword-tag/keyword-tag.component";

/**
 * Keywords grid component that displays keywords in a responsive grid layout
 * Mimics the visual design from group.svg
 */
@Component({
  selector: "app-keywords-grid",
  standalone: true,
  imports: [CommonModule, KeywordTagComponent],
  template: `
    <div
      class="keywords-grid-container"
      [style.--grid-columns]="gridConfig.columns"
      [style.--grid-gap]="gridConfig.gap + 'px'"
    >
      <div class="keywords-grid">
        @for (keyword of keywords; track keyword.id) {
          <app-keyword-tag
            [keyword]="keyword"
            (tagClicked)="onTagClicked($event)"
          />
        }
      </div>
    </div>
  `,
  styleUrl: "./keywords-grid.component.scss",
})
export class KeywordsGridComponent {
  @Input() keywords: KeywordData[] = [];
  @Input() gridConfig: KeywordsGridConfig = {
    columns: 5,
    gap: 16,
    animationDuration: 300,
  };

  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();

  // Signal for selected keywords count
  selectedCount = computed(
    () => this.keywords.filter((keyword) => keyword.isSelected).length,
  );

  /**
   * Handle keyword tag click
   */
  onTagClicked(keyword: KeywordData): void {
    if (keyword.isSelected) {
      this.keywordDeselected.emit(keyword);
    } else {
      this.keywordSelected.emit(keyword);
    }
  }

  /**
   * Get grid template columns CSS value
   */
  getGridColumns(): string {
    return `repeat(${this.gridConfig.columns}, 1fr)`;
  }
}
