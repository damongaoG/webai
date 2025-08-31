import { Component, Input, Output, EventEmitter } from "@angular/core";
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
    <div class="keywords-grid-container">
      @if (keywords.length > 0) {
        <div
          class="keywords-grid grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          @for (keyword of keywords; track keyword.id) {
            <app-keyword-tag
              [keyword]="keyword"
              (tagClicked)="onTagClicked($event)"
            />
          }
        </div>
      } @else {
        <div class="no-keywords-message">
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
              No available keywords
            </p>
            <p class="text-gray-400 text-xs mt-1">
              Keywords will appear here once they are generated
            </p>
          </div>
        </div>
      }
    </div>
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
   * Handle keyword tag click
   */
  onTagClicked(keyword: KeywordData): void {
    console.log("Keyword clicked:", keyword);
    keyword.isSelected = !keyword.isSelected;
    if (keyword.isSelected) {
      this.keywordDeselected.emit(keyword);
    } else {
      this.keywordSelected.emit(keyword);
    }
  }
}
