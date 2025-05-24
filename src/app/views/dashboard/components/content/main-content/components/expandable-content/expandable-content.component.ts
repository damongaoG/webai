import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import {
  ExpandableState,
  KeywordData,
} from "../../interfaces/keyword.interface";
import { KeywordsGridComponent } from "../keywords-grid/keywords-grid.component";

/**
 * Expandable content component that handles different types of expandable content
 * Currently supports keywords grid with animation
 */
@Component({
  selector: "app-expandable-content",
  standalone: true,
  imports: [CommonModule, KeywordsGridComponent],
  template: `
    <div
      class="expandable-container"
      [@expandCollapse]="isExpanded() ? 'expanded' : 'collapsed'"
      (@expandCollapse.start)="onAnimationStart()"
      (@expandCollapse.done)="onAnimationDone()"
    >
      <div class="expandable-content">
        @if (expandableState.contentType === "keywords" && isExpanded()) {
          <app-keywords-grid
            [keywords]="keywordsData"
            [gridConfig]="keywordsGridConfig"
            (keywordSelected)="onKeywordSelected($event)"
            (keywordDeselected)="onKeywordDeselected($event)"
          />
        }

        @if (expandableState.contentType === "assignment" && isExpanded()) {
          <div class="placeholder-content">
            <p>Assignment content will be implemented here</p>
          </div>
        }

        @if (expandableState.contentType === "arguments" && isExpanded()) {
          <div class="placeholder-content">
            <p>Arguments content will be implemented here</p>
          </div>
        }

        @if (expandableState.contentType === "references" && isExpanded()) {
          <div class="placeholder-content">
            <p>References content will be implemented here</p>
          </div>
        }

        @if (expandableState.contentType === "casestudies" && isExpanded()) {
          <div class="placeholder-content">
            <p>Case studies content will be implemented here</p>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: "./expandable-content.component.scss",
  animations: [
    trigger("expandCollapse", [
      state(
        "collapsed",
        style({
          height: "0px",
          opacity: 0,
          overflow: "hidden",
        }),
      ),
      state(
        "expanded",
        style({
          height: "*",
          opacity: 1,
          overflow: "visible",
        }),
      ),
      transition("collapsed <=> expanded", [
        animate("300ms cubic-bezier(0.4, 0.0, 0.2, 1)"),
      ]),
    ]),
  ],
})
export class ExpandableContentComponent {
  @Input() expandableState!: ExpandableState;
  @Input() keywordsData: KeywordData[] = [];
  @Input() keywordsGridConfig = {
    columns: 5,
    gap: 16,
    animationDuration: 300,
  };

  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();
  @Output() animationStart = new EventEmitter<void>();
  @Output() animationComplete = new EventEmitter<void>();

  // Signal for expanded state
  isExpanded = computed(() => this.expandableState.isExpanded);

  /**
   * Handle keyword selection
   */
  onKeywordSelected(keyword: KeywordData): void {
    this.keywordSelected.emit(keyword);
  }

  /**
   * Handle keyword deselection
   */
  onKeywordDeselected(keyword: KeywordData): void {
    this.keywordDeselected.emit(keyword);
  }

  /**
   * Handle animation start
   */
  onAnimationStart(): void {
    this.animationStart.emit();
  }

  /**
   * Handle animation completion
   */
  onAnimationDone(): void {
    this.animationComplete.emit();
  }
}
