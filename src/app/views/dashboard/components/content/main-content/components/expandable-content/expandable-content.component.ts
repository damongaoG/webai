import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  inject,
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
import { ArgumentsGridComponent } from "../arguments-grid/arguments-grid.component";
import { EssayStateService } from "@/app/services/essay-state.service";
import {
  SidebarStateService,
  ContentType,
} from "@/app/services/sidebar-state.service";
import { ArgumentData } from "@/app/interfaces/essay-create.interface";

/**
 * Expandable content component that handles different types of expandable content
 * Currently supports keywords grid with animation
 */
@Component({
  selector: "app-expandable-content",
  standalone: true,
  imports: [CommonModule, KeywordsGridComponent, ArgumentsGridComponent],
  template: `
    <div
      class="expandable-container"
      [@expandCollapse]="isExpanded() ? 'expanded' : 'collapsed'"
      (@expandCollapse.start)="onAnimationStart()"
      (@expandCollapse.done)="onAnimationDone()"
    >
      <div class="expandable-content">
        @if (expandableState.contentType === "keywords" && isExpanded()) {
          @if (isInteractionAllowed()) {
            <app-keywords-grid
              [keywords]="keywordsData"
              [gridConfig]="keywordsGridConfig"
              (keywordSelected)="onKeywordSelected($event)"
              (keywordDeselected)="onKeywordDeselected($event)"
            />
          } @else {
            <div class="disabled-content">
              <div class="disabled-overlay">
                <p class="disabled-message">
                  <svg
                    class="w-6 h-6 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                  Complete the essay title creation first
                </p>
              </div>
            </div>
          }
        }

        <!--        @if (expandableState.contentType === "assignment" && isExpanded()) {-->
        <!--          @if (isInteractionAllowed()) {-->
        <!--            <div class="placeholder-content">-->
        <!--              <p>Assignment content will be implemented here</p>-->
        <!--            </div>-->
        <!--          } @else {-->
        <!--            <div class="disabled-content">-->
        <!--              <div class="disabled-overlay">-->
        <!--                <p class="disabled-message">-->
        <!--                  <svg-->
        <!--                    class="w-6 h-6 text-gray-400 mx-auto mb-2"-->
        <!--                    fill="none"-->
        <!--                    stroke="currentColor"-->
        <!--                    viewBox="0 0 24 24"-->
        <!--                  >-->
        <!--                    <path-->
        <!--                      stroke-linecap="round"-->
        <!--                      stroke-linejoin="round"-->
        <!--                      stroke-width="2"-->
        <!--                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"-->
        <!--                    ></path>-->
        <!--                  </svg>-->
        <!--                  Select keywords first to unlock this feature-->
        <!--                </p>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          }-->
        <!--        }-->

        @if (expandableState.contentType === "arguments" && isExpanded()) {
          @if (isInteractionAllowed()) {
            <app-arguments-grid
              [arguments]="argumentsData"
              [gridConfig]="argumentsGridConfig"
              (argumentSelected)="onArgumentSelected($event)"
              (argumentDeselected)="onArgumentDeselected($event)"
            />
          } @else {
            <div class="disabled-content">
              <div class="disabled-overlay">
                <p class="disabled-message">
                  <svg
                    class="w-6 h-6 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                  Select keywords first to unlock this feature
                </p>
              </div>
            </div>
          }
        }

        @if (expandableState.contentType === "references" && isExpanded()) {
          @if (isInteractionAllowed()) {
            <div class="placeholder-content">
              <p>References content will be implemented here</p>
            </div>
          } @else {
            <div class="disabled-content">
              <div class="disabled-overlay">
                <p class="disabled-message">
                  <svg
                    class="w-6 h-6 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                  Select keywords first to unlock this feature
                </p>
              </div>
            </div>
          }
        }

        @if (expandableState.contentType === "casestudies" && isExpanded()) {
          @if (isInteractionAllowed()) {
            <div class="placeholder-content">
              <p>Case studies content will be implemented here</p>
            </div>
          } @else {
            <div class="disabled-content">
              <div class="disabled-overlay">
                <p class="disabled-message">
                  <svg
                    class="w-6 h-6 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path>
                  </svg>
                  Select keywords first to unlock this feature
                </p>
              </div>
            </div>
          }
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
  @Input() argumentsData: ArgumentData[] = [];
  @Input() keywordsGridConfig = {
    columns: 5,
    gap: 16,
    animationDuration: 300,
  };
  @Input() argumentsGridConfig = {
    columns: 3,
    gap: 16,
    animationDuration: 300,
  };

  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();
  @Output() argumentSelected = new EventEmitter<ArgumentData>();
  @Output() argumentDeselected = new EventEmitter<ArgumentData>();
  @Output() animationStart = new EventEmitter<void>();
  @Output() animationComplete = new EventEmitter<void>();

  // Inject services
  private readonly essayStateService = inject(EssayStateService);
  private readonly sidebarStateService = inject(SidebarStateService);

  // Signal for expanded state
  isExpanded = computed(() => this.expandableState?.isExpanded ?? false);

  // Computed signal to check if interaction is allowed based on essay state and context
  isInteractionAllowed = computed(() => {
    const currentContent = this.sidebarStateService.selectedContent();
    const contentType = this.expandableState?.contentType;

    // Only apply restrictions when in ESSAY_MODEL content type
    if (currentContent !== ContentType.ESSAY_MODEL || !contentType) {
      return true;
    }

    console.log(
      "isInteractionAllowed",
      this.essayStateService.isInteractionAllowed(contentType),
    );
    // Check if the specific content type interaction is allowed
    return this.essayStateService.isInteractionAllowed(contentType);
  });

  /**
   * Handle keyword selection
   */
  onKeywordSelected(keyword: KeywordData): void {
    this.keywordSelected.emit(keyword);
    // Single-source update: add the selected keyword to global state
    this.essayStateService.addSelectedKeyword(keyword.text);
  }

  /**
   * Handle keyword deselection
   */
  onKeywordDeselected(keyword: KeywordData): void {
    this.keywordDeselected.emit(keyword);
    // Single-source update: remove the deselected keyword from global state
    this.essayStateService.removeSelectedKeyword(keyword.text);
  }

  /**
   * Handle argument selection
   */
  onArgumentSelected(argument: ArgumentData): void {
    this.argumentSelected.emit(argument);
    this.essayStateService.addSelectedArgumentId(argument.id);
  }

  /**
   * Handle argument deselection
   */
  onArgumentDeselected(argument: ArgumentData): void {
    this.argumentDeselected.emit(argument);
    this.essayStateService.removeSelectedArgumentId(argument.id);
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
