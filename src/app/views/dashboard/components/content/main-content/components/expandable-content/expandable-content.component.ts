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
import {
  ArgumentData,
  ScholarData,
} from "@/app/interfaces/essay-create.interface";
import { type ModelCaseVO } from "@/app/interfaces/model-case.interface";
import { marked } from "marked";

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
            <div class="references-list space-y-3" style="padding: 1rem">
              <div class="grid-toolbar" *ngIf="scholars.length > 0">
                <label
                  class="select-all flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    [checked]="areAllSelected"
                    [indeterminate]="isPartiallySelected"
                    (change)="onToggleSelectAll($event)"
                    aria-label="Select all references"
                  />
                  <span>Select all</span>
                  <span class="opacity-70"
                    >({{ selectedCount }}/{{ scholars.length }})</span
                  >
                </label>
              </div>
              <ul class="divide-y divide-gray-200/50">
                @for (scholar of scholars; track scholar.id) {
                  <li class="py-2 flex items-start gap-3">
                    <input
                      type="checkbox"
                      class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      [checked]="isScholarSelected(scholar.id)"
                      (change)="onScholarChange(scholar.id, $event)"
                      aria-label="Select reference"
                    />
                    <div class="min-w-0 flex-1">
                      <a
                        class="text-sm sm:text-base font-medium text-blue-700 hover:underline break-words"
                        [href]="scholar.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ scholar.title }}</a
                      >
                      <div
                        class="text-xs sm:text-sm text-gray-500 mt-1 break-words"
                      >
                        {{ scholar.snippet }}
                      </div>
                      <div class="text-[11px] text-gray-400 mt-0.5">
                        {{ scholar.source }}
                      </div>
                    </div>
                  </li>
                }
              </ul>
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
            @if (isCasesLoading) {
              <div
                class="casestudies-inline-loading px-4 sm:px-6 lg:px-8 py-3 text-sm text-stone-600"
                role="status"
                aria-live="polite"
              >
                <span class="inline-flex items-center gap-2">
                  <svg
                    class="animate-spin h-4 w-4 text-stone-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Loading case studies...
                </span>
              </div>
            }
            @if (visibleCaseItems.length > 0) {
              <div class="casestudies-list space-y-3" style="padding: 1rem">
                <div class="grid-toolbar" *ngIf="visibleCaseItems.length > 0">
                  <label
                    class="select-all flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      [checked]="areAllCasesSelected"
                      [indeterminate]="isPartiallyCasesSelected"
                      (change)="onToggleSelectAllCases($event)"
                      aria-label="Select all case studies"
                    />
                    <span>Select all</span>
                    <span class="opacity-70"
                      >({{ selectedCaseCount }}/{{
                        visibleCaseItems.length
                      }})</span
                    >
                  </label>
                </div>
                @for (item of visibleCaseItems; track item.id) {
                  <div
                    class="case-item rounded-md border border-gray-200/70 p-3 sm:p-4 bg-white/60"
                  >
                    <div class="flex items-start gap-3 mb-2">
                      <input
                        type="checkbox"
                        class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        [checked]="isCaseItemSelected(item.id)"
                        (change)="onCaseItemChange(item.id, $event)"
                        aria-label="Select case study"
                      />
                      <div class="min-w-0 flex-1">
                        @if (item.link) {
                          <a
                            class="text-sm sm:text-base font-medium text-blue-700 hover:underline break-words"
                            [href]="item.link"
                            target="_blank"
                            rel="noopener noreferrer"
                            >Case #{{ item.index + 1 }}</a
                          >
                        } @else {
                          <div
                            class="text-sm sm:text-base font-medium text-gray-800"
                          >
                            Case #{{ item.index + 1 }}
                          </div>
                        }
                      </div>
                    </div>
                    @if (item.results?.length) {
                      <ul class="case-results list-disc pl-5 space-y-1">
                        @for (r of item.results; track r.title) {
                          <li>
                            <span class="font-medium">{{ r.title }}</span>
                            @if (r.timePeriod) {
                              <span class="opacity-70">
                                ({{ r.timePeriod }})</span
                              >
                            }
                            @if (r.background) {
                              <div class="text-gray-600 text-xs">
                                Background: {{ r.background }}
                              </div>
                            }
                            @if (r.methodology) {
                              <div class="text-gray-600 text-xs">
                                Methodology: {{ r.methodology }}
                              </div>
                            }
                            @if (r.findings) {
                              <div class="text-gray-600 text-xs">
                                Findings: {{ r.findings }}
                              </div>
                            }
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>
            } @else {
              @if (!isCasesLoading) {
                <div
                  class="cases-empty text-gray-500 text-sm"
                  style="padding: 1rem"
                >
                  No case studies yet.
                </div>
              }
            }
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
                  Select references first to unlock this feature
                </p>
              </div>
            </div>
          }
        }

        @if (expandableState.contentType === "summary" && isExpanded()) {
          @if (isInteractionAllowed()) {
            @if (isSummaryLoading) {
              <div
                class="summary-inline-loading px-4 sm:px-6 lg:px-8 py-3 text-sm text-stone-600"
                role="status"
                aria-live="polite"
              >
                <span class="inline-flex items-center gap-2">
                  <svg
                    class="animate-spin h-4 w-4 text-stone-500"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Generating summary...
                </span>
              </div>
            }
            <div
              class="summary-content"
              style="padding: 1rem"
              role="article"
              aria-live="polite"
            >
              @if (summaryText && summaryText.length > 0) {
                <div
                  class="text-sm sm:text-base text-gray-700"
                  [innerHTML]="summaryHtml()"
                ></div>
                @if (!isSummaryLoading) {
                  <div class="mt-4">
                    <button
                      type="button"
                      class="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      (click)="onGenerateEssayClick()"
                      aria-label="Generate full essay from summary"
                    >
                      <span>Generate Essay</span>
                    </button>
                  </div>
                }
              } @else {
                @if (!isSummaryLoading) {
                  <div class="summary-empty text-gray-500 text-sm">
                    No summary yet.
                  </div>
                }
              }
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
                  Select case studies first to unlock this feature
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
  @Input() scholars: ScholarData[] = [];
  @Input() caseItems: ReadonlyArray<ModelCaseVO> = [];
  @Input() isCasesLoading: boolean = false;
  @Input() isSummaryLoading: boolean = false;
  @Input() summaryText: string = "";
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
  @Output() generateEssay = new EventEmitter<void>();

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

  /**
   * Scholar selection helpers
   */
  isScholarSelected(scholarId: string): boolean {
    return this.essayStateService.selectedScholarIds().includes(scholarId);
  }

  onScholarChange(scholarId: string, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const isChecked = !!input?.checked;
    if (isChecked) {
      this.essayStateService.addSelectedScholarId(scholarId);
    } else {
      this.essayStateService.removeSelectedScholarId(scholarId);
    }
  }

  get selectedCount(): number {
    const selectedIds = new Set(this.essayStateService.selectedScholarIds());
    if (!this.scholars || this.scholars.length === 0) return 0;
    let count = 0;
    for (const s of this.scholars) if (selectedIds.has(s.id)) count++;
    return count;
  }

  get areAllSelected(): boolean {
    const total = this.scholars?.length ?? 0;
    return total > 0 && this.selectedCount === total;
  }

  get isPartiallySelected(): boolean {
    const total = this.scholars?.length ?? 0;
    const size = this.selectedCount;
    return size > 0 && size < total;
  }

  onToggleSelectAll(event: Event): void {
    event.stopPropagation();
    this.toggleSelectAll();
  }

  toggleSelectAll(): void {
    if (this.areAllSelected) this.clearSelection();
    else this.selectAll();
  }

  selectAll(): void {
    if (!this.scholars || this.scholars.length === 0) return;
    const previouslySelected = new Set(
      this.essayStateService.selectedScholarIds(),
    );
    for (const scholar of this.scholars) {
      if (!previouslySelected.has(scholar.id)) {
        this.essayStateService.addSelectedScholarId(scholar.id);
      }
    }
  }

  clearSelection(): void {
    if (!this.scholars || this.scholars.length === 0) return;
    const visibleIds = new Set(this.scholars.map((s) => s.id));
    for (const id of this.essayStateService.selectedScholarIds()) {
      if (visibleIds.has(id)) {
        this.essayStateService.removeSelectedScholarId(id);
      }
    }
  }

  /**
   * Filtered case items without errors
   */
  get visibleCaseItems(): ReadonlyArray<ModelCaseVO> {
    const items = this.caseItems ?? [];
    if (!Array.isArray(items) || items.length === 0) return items;
    return items.filter((i) => !i.error && (i.results?.length ?? 0) > 0);
  }

  /**
   * Case selection helpers (mirror references)
   */
  get selectedCaseCount(): number {
    const selected = new Set(this.essayStateService.selectedCaseItemIds());
    const items = this.visibleCaseItems;
    if (!items || items.length === 0) return 0;
    let count = 0;
    for (const it of items) if (selected.has(it.id as string)) count++;
    return count;
  }

  get areAllCasesSelected(): boolean {
    const total = this.visibleCaseItems.length;
    return total > 0 && this.selectedCaseCount === total;
  }

  get isPartiallyCasesSelected(): boolean {
    const total = this.visibleCaseItems.length;
    const size = this.selectedCaseCount;
    return size > 0 && size < total;
  }

  isCaseItemSelected(id: string | undefined): boolean {
    if (!id) return false;
    return this.essayStateService.selectedCaseItemIds().includes(id);
  }

  onCaseItemChange(id: string | undefined, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const isChecked = !!input?.checked;
    if (!id) return;
    if (isChecked) this.essayStateService.addSelectedCaseItemId(id);
    else this.essayStateService.removeSelectedCaseItemId(id);
  }

  onToggleSelectAllCases(event: Event): void {
    event.stopPropagation();
    this.toggleSelectAllCases();
  }

  toggleSelectAllCases(): void {
    if (this.areAllCasesSelected) this.clearCaseSelection();
    else this.selectAllCases();
  }

  selectAllCases(): void {
    const items = this.visibleCaseItems;
    if (!items || items.length === 0) return;
    const previously = new Set(this.essayStateService.selectedCaseItemIds());
    for (const it of items) {
      const id = it.id as string | undefined;
      if (id && !previously.has(id)) {
        this.essayStateService.addSelectedCaseItemId(id);
      }
    }
  }

  clearCaseSelection(): void {
    const items = this.visibleCaseItems;
    if (!items || items.length === 0) return;
    const visibleIds = new Set(
      items.map((i) => i.id).filter(Boolean) as string[],
    );
    for (const cid of this.essayStateService.selectedCaseItemIds()) {
      if (visibleIds.has(cid)) {
        this.essayStateService.removeSelectedCaseItemId(cid);
      }
    }
  }

  /**
   * Render summary markdown to HTML
   * Angular will sanitize the string bound via [innerHTML]
   */
  summaryHtml(): string {
    if (!this.summaryText) return "";
    return (marked.parse(this.summaryText, { async: false, breaks: true }) ||
      "") as string;
  }

  /**
   * Prompt user for essay word count and emit clamped value (1000–8000)
   */
  onGenerateEssayClick(): void {
    this.generateEssay.emit();
  }
}
