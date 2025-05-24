import { Component, Input, Output, EventEmitter, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { KeywordData } from "../../interfaces/keyword.interface";

/**
 * Individual keyword tag component
 * Displays a single keyword with selection state and click handling
 */
@Component({
  selector: "app-keyword-tag",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="keyword-tag"
      [class.selected]="keyword.isSelected"
      [class.hover]="isHovered()"
      (click)="onTagClick()"
      (mouseenter)="isHovered.set(true)"
      (mouseleave)="isHovered.set(false)"
    >
      <span class="keyword-text">{{ keyword.text }}</span>
    </div>
  `,
  styleUrl: "./keyword-tag.component.scss",
})
export class KeywordTagComponent {
  @Input() keyword!: KeywordData;
  @Output() tagClicked = new EventEmitter<KeywordData>();

  // Signal for hover state management
  isHovered = signal(false);

  /**
   * Handle tag click event
   */
  onTagClick(): void {
    this.tagClicked.emit(this.keyword);
  }
}
