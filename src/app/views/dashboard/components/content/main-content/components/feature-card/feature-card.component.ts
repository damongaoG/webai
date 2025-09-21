import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FeatureCard,
  CardState,
} from "../../interfaces/feature-card.interface";
import { ExpandableContentComponent } from "../expandable-content/expandable-content.component";
import { KeywordData } from "../../interfaces/keyword.interface";
import { TaskType } from "@/app/interfaces/task.interface";
import { TaskSelectionService } from "@/app/services/task-selection.service";
import {
  EssayCreationPhase,
  EssayStateService,
} from "@/app/services/essay-state.service";
import { EssayService } from "@/app/services/essay.service";
import { parseKeywordsToData } from "@/app/helper/utils";
import { catchError, finalize, of, Subscription } from "rxjs";
import {
  ArgumentData,
  ScholarData,
} from "@/app/interfaces/essay-create.interface";
import { ToastService } from "@/app/shared";
import { WordcountInputModalComponent } from "@/app/shared/components/wordcount-input-modal/wordcount-input-modal.component";
import { DashboardSharedService } from "../../../dashboard-shared.service";
import { Result } from "@/app/interfaces/result";
import { type ModelCaseVO } from "@/app/interfaces/model-case.interface";
import { type SummarySseItem } from "@/app/interfaces/summary-sse.interface";

@Component({
  selector: "app-feature-card",
  standalone: true,
  imports: [
    CommonModule,
    ExpandableContentComponent,
    WordcountInputModalComponent,
  ],
  templateUrl: "./feature-card.component.html",
  styleUrl: "./feature-card.component.scss",
})
export class FeatureCardComponent implements OnDestroy {
  @Input() featureCard!: FeatureCard;

  @Input() cardState!: CardState;
  @Input() taskType!: TaskType;

  @Output() expandClicked = new EventEmitter<string>();

  @Output() expandHoverStart = new EventEmitter<string>();

  @Output() expandHoverEnd = new EventEmitter<string>();
  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();
  @Output() argumentSelected = new EventEmitter<ArgumentData>();
  @Output() argumentDeselected = new EventEmitter<ArgumentData>();
  @Output() undoClicked = new EventEmitter<void>();
  @Output() redoClicked = new EventEmitter<void>();

  private taskSelectionService = inject(TaskSelectionService);
  private readonly essayStateService = inject(EssayStateService);
  private readonly essayService = inject(EssayService);
  private readonly toastService = inject(ToastService);
  private readonly dashboardSharedService = inject(DashboardSharedService);

  // Visibility state for wordcount modal
  wordcountModalVisible = signal(false);

  // Signal to store fetched keywords
  private readonly fetchedKeywords = signal<KeywordData[]>([]);
  readonly isLoadingKeywords = signal<boolean>(false);

  // Signal to store fetched arguments
  private readonly fetchedArguments = signal<ArgumentData[]>([]);
  readonly isLoadingArguments = signal<boolean>(false);

  // Signal to store fetched scholars (references)
  private readonly fetchedScholars = signal<ScholarData[]>([]);
  readonly isLoadingScholars = signal<boolean>(false);

  // Local redo state (kept minimal; global source of truth is EssayStateService)
  private readonly lastUndoneCardId = signal<string | null>(null);

  // Track whether this card has already successfully loaded its data once
  private hasLoadedContent = false;

  // Hold SSE subscription for casestudies stream (Task 1: trigger only)
  private caseStreamSub?: Subscription;
  // Hold SSE subscription for summary stream
  private summaryStreamSub?: Subscription;

  // Loading state for casestudies stream (until first payload arrives)
  readonly isLoadingCases = signal<boolean>(false);
  // Loading state for summary stream
  readonly isLoadingSummary = signal<boolean>(false);
  // Track whether summary stream has completed to control Undo visibility on summary card
  private readonly summaryCompleted = signal<boolean>(false);

  // Accumulated stream items for case studies (appended upon each valid payload)
  private readonly caseItems = signal<ReadonlyArray<ModelCaseVO>>([]);
  // Accumulated items for summary stream (if needed by future UI)
  private readonly summaryItems = signal<ReadonlyArray<SummarySseItem>>([]);
  // Track whether casestudies has been opened via stream or redo success
  private readonly hasOpenedCases = signal<boolean>(false);

  onExpandClick(): void {
    // Block interaction when not allowed or while any content is loading
    if (this.isExpandDisabled) {
      console.warn(
        `Interaction with ${this.featureCard.id} is not allowed in current essay phase`,
      );
      return;
    }

    this.expandClicked.emit(this.featureCard.id);

    if (this.taskType) {
      const isExpanded = !this.shouldShowExpandableContent;
      this.taskSelectionService.selectTask(
        this.taskType,
        isExpanded,
        this.featureCard.id,
      );

      // If expanding keywords card, fetch keywords from API (only first time per session)
      if (
        isExpanded &&
        this.featureCard.id === "keywords" &&
        !this.hasLoadedContent
      ) {
        this.fetchKeywords();
      }

      // If expanding arguments card, fetch arguments from API (only first time per session)
      if (isExpanded && this.featureCard.id === "arguments") {
        const sharedArgs = this.essayStateService.availableArguments();
        if (Array.isArray(sharedArgs) && sharedArgs.length > 0) {
          this.fetchedArguments.set(sharedArgs);
          this.hasLoadedContent = true;
        } else if (!this.hasLoadedContent) {
          this.fetchArguments();
        }
      }

      // If expanding references card, conditionally fetch scholars from API (only first time per session)
      if (isExpanded && this.featureCard.id === "references") {
        const sharedScholars = this.essayStateService.availableScholars();
        if (Array.isArray(sharedScholars) && sharedScholars.length > 0) {
          this.fetchedScholars.set(sharedScholars);
          this.hasLoadedContent = true;
        } else if (!this.hasLoadedContent) {
          const phase = this.essayStateService.currentPhase();
          const hasLocalScholars = this.fetchedScholars().length > 0;
          // Only fetch when moving forward from arguments, or when no local data exists
          if (
            phase === EssayCreationPhase.ARGUMENT_SELECTED ||
            !hasLocalScholars
          ) {
            this.fetchScholars();
          }
        }
      }

      // If expanding casestudies card, start SSE stream only once per session
      if (isExpanded && this.featureCard.id === "casestudies") {
        if (!this.hasLoadedContent) {
          this.startCaseStudiesStream();
        } else {
          // Already loaded in this session; just mark as opened for UI/undo visibility
          this.hasOpenedCases.set(true);
        }
      }

      // If expanding summary card, start SSE stream only once per session
      if (isExpanded && this.featureCard.id === "summary") {
        if (!this.hasLoadedContent) {
          this.startSummaryStream();
        }
      }

      // If collapsing casestudies card, stop SSE stream (do not clear items to preserve once-per-session data)
      if (!isExpanded && this.featureCard.id === "casestudies") {
        if (this.caseStreamSub) {
          this.caseStreamSub.unsubscribe();
          this.caseStreamSub = undefined;
        }
        this.isLoadingCases.set(false);
      }

      // If collapsing summary card, stop SSE stream
      if (!isExpanded && this.featureCard.id === "summary") {
        if (this.summaryStreamSub) {
          this.summaryStreamSub.unsubscribe();
          this.summaryStreamSub = undefined;
        }
        this.isLoadingSummary.set(false);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.caseStreamSub) {
      this.caseStreamSub.unsubscribe();
      this.caseStreamSub = undefined;
    }
    this.isLoadingCases.set(false);
    this.caseItems.set([]);
    this.hasOpenedCases.set(false);

    if (this.summaryStreamSub) {
      this.summaryStreamSub.unsubscribe();
      this.summaryStreamSub = undefined;
    }
    this.isLoadingSummary.set(false);
    this.summaryItems.set([]);
  }

  /**
   * Trigger data fetch when the card is expanded externally (e.g., via sidebar selection).
   * Does not toggle expand state or emit events; only performs the same fetch side-effects as expand.
   */
  triggerExpandFetchIfNeeded(): void {
    if (this.isExpandDisabled) {
      return;
    }

    if (!this.shouldShowExpandableContent) {
      return;
    }

    if (this.featureCard.id === "keywords" && !this.hasLoadedContent) {
      this.fetchKeywords();
    }

    if (this.featureCard.id === "arguments") {
      const sharedArgs = this.essayStateService.availableArguments();
      if (Array.isArray(sharedArgs) && sharedArgs.length > 0) {
        this.fetchedArguments.set(sharedArgs);
        this.hasLoadedContent = true;
      } else if (!this.hasLoadedContent) {
        this.fetchArguments();
      }
    }

    if (this.featureCard.id === "references") {
      const sharedScholars = this.essayStateService.availableScholars();
      if (Array.isArray(sharedScholars) && sharedScholars.length > 0) {
        this.fetchedScholars.set(sharedScholars);
        this.hasLoadedContent = true;
      } else if (!this.hasLoadedContent) {
        const phase = this.essayStateService.currentPhase();
        const hasLocalScholars = this.fetchedScholars().length > 0;
        // Avoid re-fetch on undo-driven navigation back to references when data already exists
        if (
          phase === EssayCreationPhase.ARGUMENT_SELECTED ||
          !hasLocalScholars
        ) {
          this.fetchScholars();
        }
      }
    }

    if (this.featureCard.id === "casestudies" && !this.hasLoadedContent) {
      this.startCaseStudiesStream();
    }

    if (this.featureCard.id === "summary" && !this.hasLoadedContent) {
      this.startSummaryStream();
    }
  }

  onExpandHoverStart(): void {
    if (this.isExpandDisabled) {
      return;
    }
    this.expandHoverStart.emit(this.featureCard.id);
  }

  onExpandHoverEnd(): void {
    if (this.isExpandDisabled) {
      return;
    }
    this.expandHoverEnd.emit(this.featureCard.id);
  }

  onKeywordSelected(keyword: KeywordData): void {
    this.keywordSelected.emit(keyword);
  }

  onKeywordDeselected(keyword: KeywordData): void {
    this.keywordDeselected.emit(keyword);
  }

  onArgumentSelected(argument: ArgumentData): void {
    this.argumentSelected.emit(argument);
  }

  onArgumentDeselected(argument: ArgumentData): void {
    this.argumentDeselected.emit(argument);
  }

  get shouldShowExpandableContent(): boolean {
    // Don't show expandable content if keywords or arguments are loading
    if (this.isLoadingKeywords() || this.isLoadingArguments()) {
      return false;
    }

    return (
      this.cardState.expandable.isExpanded &&
      this.cardState.expandable.contentType === this.featureCard.id
    );
  }

  get keywordsData(): KeywordData[] {
    if (this.featureCard.id === "keywords") {
      // Return fetched keywords if available, otherwise return empty array
      return this.fetchedKeywords();
    }
    return [];
  }

  get argumentsData(): ArgumentData[] {
    if (this.featureCard.id === "arguments") {
      // Prefer shared cache to avoid redundant fetches after redo
      const shared = this.essayStateService.availableArguments();
      if (Array.isArray(shared) && shared.length > 0) return shared;
      return this.fetchedArguments();
    }
    return [];
  }

  get scholarsData(): ScholarData[] {
    if (this.featureCard.id === "references") {
      const shared = this.essayStateService.availableScholars();
      if (Array.isArray(shared) && shared.length > 0) return shared;
      return this.fetchedScholars();
    }
    return [];
  }

  get isInteractionAllowed(): boolean {
    return this.essayStateService.isInteractionAllowed(this.featureCard.id);
  }

  get shouldShowUndoButton(): boolean {
    const phase = this.essayStateService.currentPhase();
    if (this.isExpandDisabled) return false;

    if (phase === "argument_selected" && this.featureCard.id === "arguments") {
      return true;
    }

    if (phase === "scholars_selected" && this.featureCard.id === "references") {
      return true;
    }
    if (this.featureCard.id === "casestudies") {
      return phase === "case_selected" && this.hasOpenedCases();
    }
    // Show Undo on summary card only after the summary stream has completed
    if (this.featureCard.id === "summary") {
      return this.summaryCompleted() && !this.isLoadingSummary();
    }
    return false;
  }

  get shouldShowRedoButton(): boolean {
    if (this.isExpandDisabled) return false;
    // Prefer global redo availability so the redo button shows on previous phase card
    if (this.essayStateService.isRedoAvailableForCard(this.featureCard.id)) {
      return true;
    }
    // Fallback to local marker if set within this component lifecycle
    return this.lastUndoneCardId() === this.featureCard.id;
  }

  onUndoClick(): void {
    this.undoClicked.emit();

    const essayId = this.essayStateService.essayId();
    if (!essayId) {
      this.toastService.error("Please create an essay first to undo");
      return;
    }

    const cardId = this.featureCard.id;
    this.setUndoLoadingForCard(cardId, true);

    this.essayService
      .undoAction(essayId)
      .pipe(
        catchError((error) => {
          console.error("Error performing undo:", error);
          this.toastService.error("Failed to undo. Please try again.");
          return of(null);
        }),
        finalize(() => this.setUndoLoadingForCard(cardId, false)),
      )
      .subscribe(
        (
          response: Result<{
            keywords?: string;
            arguments?: ArgumentData[];
          }> | null,
        ) => {
          if (!response || response.code !== 1 || !response.data) {
            this.toastService.error("Invalid undo response from server");
            return;
          }

          const previousPhase = this.essayStateService.currentPhase();
          const data = response.data;

          if (cardId === "summary") {
            this.handleUndoForSummary();
            return;
          }

          this.handleUndoSuccessForCard(cardId, data);
          this.hasLoadedContent = false;

          const redoTarget = this.computeRedoTargetForUndo(cardId);
          this.essayStateService.setRedoState(redoTarget);
          this.lastUndoneCardId.set(redoTarget);

          this.navigateAfterUndo(previousPhase);
        },
      );
  }

  onRedoClick(): void {
    this.redoClicked.emit();

    const essayId = this.essayStateService.essayId();
    if (!essayId) {
      this.toastService.error("Please create an essay first to redo");
      return;
    }

    // Capture the phase at the moment redo is initiated
    const phaseAtRedo = this.essayStateService.currentPhase();

    // Pre-advance the phase before calling API as required
    // - title_created -> keywords_selected
    // - keywords_selected -> argument_selected
    this.essayStateService.preAdvancePhaseForRedo();

    console.log("Phase at redo:", phaseAtRedo);

    // Determine redo target from global state (previous-phase card)
    const redoTarget = this.essayStateService.redoTargetCardId();

    // Set loading flags based on what we're redoing to
    if (redoTarget === "keywords") {
      // We are moving forward to arguments
      this.isLoadingArguments.set(true);
      this.essayStateService.setArgumentsLoading(true);
    } else if (redoTarget === "arguments") {
      // We are moving forward to scholars
      this.isLoadingScholars.set(true);
      this.essayStateService.setScholarsLoading(true);
    } else if (redoTarget === "references") {
      // Moving forward to casestudies does not require pre-loading flags
    }

    this.essayService
      .redoAction(essayId)
      .pipe(
        catchError((error) => {
          console.error("Error performing redo:", error);
          this.isLoadingArguments.set(false);
          this.isLoadingScholars.set(false);
          this.essayStateService.setArgumentsLoading(false);
          this.essayStateService.setScholarsLoading(false);
          this.toastService.error("Failed to redo. Please try again.");
          return of(null);
        }),
      )
      .subscribe(
        (
          response: Result<{
            keywords?: string;
            arguments?: ArgumentData[];
          }> | null,
        ) => {
          this.isLoadingArguments.set(false);
          this.isLoadingScholars.set(false);
          this.essayStateService.setArgumentsLoading(false);
          this.essayStateService.setScholarsLoading(false);

          if (!response || response.code !== 1 || !response.data) {
            this.toastService.error("Invalid redo response from server");
            return;
          }

          const data = response.data;

          // Restore selection state based on the phase when redo was performed
          if (phaseAtRedo === "title_created") {
            const keywordsFromApi = (data.keywords ?? "")
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k.length > 0);
            this.essayStateService.setSelectedKeywords(keywordsFromApi);
          } else if (phaseAtRedo === "keywords_selected") {
            const keywordsFromApi = (data.keywords ?? "")
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k.length > 0);
            this.essayStateService.setSelectedKeywords(keywordsFromApi);
          } else if (phaseAtRedo === "argument_selected") {
            const selectedArgumentIdsFromApi = Array.isArray(data.arguments)
              ? data.arguments
                  .filter((arg) => !!arg.isSelected)
                  .map((arg) => arg.id)
              : [];
            this.essayStateService.setSelectedArgumentIds(
              selectedArgumentIdsFromApi,
            );
          }

          // Update local data based on redo target rather than current card id
          if (redoTarget === "keywords") {
            // Move forward to arguments available again
            const argumentsFromApi = Array.isArray(data.arguments)
              ? data.arguments
              : [];
            this.fetchedArguments.set(argumentsFromApi);
            this.essayStateService.setAvailableArguments(argumentsFromApi);
            this.essayStateService.advancePhaseAfterArgumentsFetchSuccess();
            // Select arguments so sidebar reflects the forward step
            this.dashboardSharedService.selectTask("arguments");
          } else if (redoTarget === "arguments") {
            // Move forward to scholars available again
            this.fetchedScholars.set([]);
            this.essayStateService.clearAvailableScholars();
            this.essayStateService.advancePhaseAfterScholarsFetchSuccess();
            // Select references so sidebar reflects the forward step
            this.dashboardSharedService.selectTask("references");
          } else if (redoTarget === "references") {
            // Move forward to case studies
            this.essayStateService.advancePhaseAfterCaseOpen();
            this.dashboardSharedService.selectTask("casestudies");
            // Mark cases as opened due to successful redo
            this.hasOpenedCases.set(true);
          } else if (redoTarget === "casestudies") {
            // Move forward from case studies to summary again
            this.dashboardSharedService.selectTask("summary");
            // Start summary stream using existing selections
            this.startSummaryStream();
          }

          // consume redo state globally and locally
          this.essayStateService.clearRedoState();
          this.lastUndoneCardId.set(null);
        },
      );
  }

  private setUndoLoadingForCard(cardId: string, loading: boolean): void {
    if (cardId === "arguments") {
      this.isLoadingArguments.set(loading);
      this.essayStateService.setArgumentsLoading(loading);
    } else if (cardId === "references") {
      this.isLoadingScholars.set(loading);
      this.essayStateService.setScholarsLoading(loading);
    }
  }

  private computeRedoTargetForUndo(
    cardId: string,
  ): "keywords" | "arguments" | "references" | "casestudies" {
    if (cardId === "arguments") return "keywords";
    if (cardId === "references") return "arguments";
    if (cardId === "casestudies") return "references";
    return "casestudies";
  }

  private navigateAfterUndo(previousPhase: string): void {
    if (previousPhase === "argument_selected") {
      this.dashboardSharedService.selectTask("keywords");
    } else if (previousPhase === "scholars_selected") {
      this.dashboardSharedService.selectTask("arguments");
    } else if (previousPhase === "case_selected") {
      this.dashboardSharedService.selectTask("references");
    }
  }

  private handleUndoSuccessForCard(
    cardId: string,
    data: { keywords?: string; arguments?: ArgumentData[] },
  ): void {
    if (cardId === "arguments") {
      this.fetchedKeywords.set(parseKeywordsToData(data.keywords ?? ""));
      this.essayStateService.setSelectedKeywords([]);
      this.essayStateService.setSelectedArgumentIds([]);
      this.essayStateService.revertToKeywordsSelectedAfterUndo();
      return;
    }
    if (cardId === "references") {
      const argumentsFromApi = Array.isArray(data.arguments)
        ? data.arguments
        : [];
      this.fetchedArguments.set(argumentsFromApi);
      this.essayStateService.setAvailableArguments(argumentsFromApi);
      this.essayStateService.setSelectedArgumentIds([]);
      this.essayStateService.setSelectedScholarIds([]);
      this.essayStateService.revertToArgumentSelectedAfterUndo();
      return;
    }
    if (cardId === "casestudies") {
      this.essayStateService.revertToScholarsSelectedAfterUndo();
      this.hasOpenedCases.set(false);
      this.caseItems.set([]);
    }
  }

  private handleUndoForSummary(): void {
    this.summaryCompleted.set(false);
    this.summaryItems.set([]);
    this.hasLoadedContent = false;
    this.essayStateService.revertToCaseSelectedAfterSummaryUndo();
    this.essayStateService.setRedoState("casestudies");
    this.lastUndoneCardId.set("casestudies");
    this.dashboardSharedService.selectTask("casestudies");
  }

  /**
   * Disable expand interaction when interaction is not allowed
   * or when any of the async data loads are in progress.
   */
  get isExpandDisabled(): boolean {
    return (
      !this.isInteractionAllowed ||
      this.isLoadingKeywords() ||
      this.isLoadingArguments() ||
      this.essayStateService.isArgumentsLoading() ||
      this.isLoadingScholars() ||
      this.essayStateService.isScholarsLoading() ||
      // When case studies stream is loading, collapse/expand must be disabled
      this.isLoadingCases() ||
      // When summary stream is loading, collapse/expand must be disabled
      this.isLoadingSummary()
    );
  }

  /**
   * Get loading state based on the specific feature card type
   */
  getLoadingState(): boolean {
    switch (this.featureCard.id) {
      case "keywords":
        return this.isLoadingKeywords();
      case "arguments":
        return this.isLoadingArguments();
      case "references":
        return this.isLoadingScholars();
      case "casestudies":
        return this.isLoadingCases();
      case "summary":
        return this.isLoadingSummary();
      default:
        return false;
    }
  }

  /**
   * Provide case items for expandable-content
   */
  get caseItemsData(): ReadonlyArray<ModelCaseVO> {
    if (this.featureCard.id === "casestudies") {
      return this.caseItems();
    }
    return [];
  }

  /**
   * Provide concatenated summary text for expandable-content
   */
  get summaryText(): string {
    if (this.featureCard.id !== "summary") return "";
    const items = this.summaryItems();
    if (!items || items.length === 0) return "";
    // Concatenate only defined result chunks in arrival order
    return items
      .map((it) => it.result || "")
      .join("")
      .trim();
  }

  /**
   * Fetch keywords from API for the current essay
   */
  private fetchKeywords(): void {
    const essayId = this.essayStateService.essayId();

    if (!essayId) {
      console.warn("No essay ID available for fetching keywords");
      this.toastService.error("Please create an essay first to fetch keywords");
      return;
    }

    this.isLoadingKeywords.set(true);

    this.essayService
      .getKeywords(essayId)
      .pipe(
        catchError((error) => {
          console.error("Error fetching keywords:", error);
          this.isLoadingKeywords.set(false);
          // Fall back to sample keywords on error
          this.toastService.error(
            "Failed to fetch keywords. Please try again.",
          );
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          this.isLoadingKeywords.set(false);

          if (response && response.code === 1 && response.data.keywords) {
            // Parse keywords string into KeywordData array
            const keywordsData = parseKeywordsToData(response.data.keywords);
            this.fetchedKeywords.set(keywordsData);
            this.hasLoadedContent = true;
          } else {
            console.warn("Invalid keywords response:", response);
            this.toastService.error("Invalid keywords response from server");
          }
        },
      });
  }

  /**
   * Fetch arguments from API for the current essay
   */
  private fetchArguments(): void {
    const essayId = this.essayStateService.essayId();
    const selectedKeywords = this.essayStateService.selectedKeywords();

    if (!essayId) {
      console.warn("No essay ID available for fetching arguments");
      this.toastService.error(
        "Please create an essay first to fetch arguments",
      );
      return;
    }

    if (selectedKeywords.length === 0) {
      console.warn("No keywords selected for fetching arguments");
      this.toastService.error("Select at least one keyword to fetch arguments");
      return;
    }

    // Convert keywords array to comma-separated string
    const keywordsString = selectedKeywords.join(",");

    this.isLoadingArguments.set(true);
    this.essayStateService.setArgumentsLoading(true);

    this.essayService
      .getArguments(essayId, keywordsString)
      .pipe(
        catchError((error) => {
          console.error("Error fetching arguments:", error);
          this.isLoadingArguments.set(false);
          this.essayStateService.setArgumentsLoading(false);
          this.toastService.error(
            "Failed to fetch arguments. Please try again.",
          );
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          this.isLoadingArguments.set(false);
          this.essayStateService.setArgumentsLoading(false);

          if (response && response.code === 1 && response.data.arguments) {
            // Store the fetched arguments
            this.fetchedArguments.set(response.data.arguments);
            this.essayStateService.setAvailableArguments(
              response.data.arguments,
            );
            // Advance phase to ARGUMENT_SELECTED to lock keywords and allow references
            this.essayStateService.advancePhaseAfterArgumentsFetchSuccess();
            this.hasLoadedContent = true;
          } else {
            console.warn("Invalid arguments response:", response);
            this.toastService.error("Invalid arguments response from server");
          }
        },
      });
  }

  /**
   * Fetch scholars (references) from API for the current essay and selected arguments
   */
  private fetchScholars(): void {
    const essayId = this.essayStateService.essayId();
    const selectedArgumentIds = this.essayStateService.selectedArgumentIds();

    if (!essayId) {
      console.warn("No essay ID available for fetching scholars");
      this.toastService.error(
        "Please create an essay first to fetch references",
      );
      return;
    }

    if (!selectedArgumentIds || selectedArgumentIds.length === 0) {
      console.warn("No selected arguments available for fetching scholars");
      this.toastService.error(
        "Select at least one argument to fetch references",
      );
      return;
    }

    const argumentsParam = selectedArgumentIds.join(",");

    // Prevent duplicate requests while a fetch is in progress
    if (
      this.isLoadingScholars() ||
      this.essayStateService.isScholarsLoading()
    ) {
      return;
    }

    this.isLoadingScholars.set(true);
    this.essayStateService.setScholarsLoading(true);

    this.essayService
      .getScholars(essayId, argumentsParam)
      .pipe(
        catchError((error) => {
          console.error("Error fetching scholars:", error);
          this.isLoadingScholars.set(false);
          this.essayStateService.setScholarsLoading(false);
          this.toastService.error(
            "Failed to fetch references. Please try again.",
          );
          return of(null);
        }),
      )
      .subscribe({
        next: (response) => {
          this.isLoadingScholars.set(false);
          this.essayStateService.setScholarsLoading(false);
          if (response && response.code === 1 && response.data?.scholars) {
            this.fetchedScholars.set(response.data.scholars);
            this.essayStateService.setAvailableScholars(response.data.scholars);
            // Advance phase to SCHOLARS_SELECTED to lock arguments
            this.essayStateService.advancePhaseAfterScholarsFetchSuccess();
            this.hasLoadedContent = true;
          } else {
            console.warn("Invalid scholars response:", response);
            this.toastService.error("Invalid references response from server");
          }
        },
      });
  }

  /**
   * Start the case studies SSE stream once per session.
   * Marks loading until first payload arrives, then sets hasLoadedContent to guard subsequent calls.
   */
  private startCaseStudiesStream(): void {
    const essayId = this.essayStateService.essayId();
    if (!essayId) {
      this.toastService.error(
        "Please create an essay first to start case studies",
      );
      return;
    }
    // Clean up any previous stream before starting a new one
    if (this.caseStreamSub) {
      this.caseStreamSub.unsubscribe();
      this.caseStreamSub = undefined;
    }
    // Set loading until first payload arrives
    this.isLoadingCases.set(true);
    // Mark cases as opened to allow Undo visibility for casestudies
    this.hasOpenedCases.set(true);
    this.caseStreamSub = this.essayService.streamModelCases(essayId).subscribe({
      next: (vo) => {
        this.hasLoadedContent = true;
        const current = this.caseItems();
        this.caseItems.set([...current, vo as ModelCaseVO]);
      },
      error: (err) => {
        console.error("Error while streaming case studies:", err);
        this.toastService.error(
          "Failed to stream case studies. Please try again.",
        );
        this.isLoadingCases.set(false);
        this.hasOpenedCases.set(false);
        if (this.caseStreamSub) {
          this.caseStreamSub.unsubscribe();
          this.caseStreamSub = undefined;
        }
      },
      complete: () => {
        this.isLoadingCases.set(false);
        if (this.caseStreamSub) {
          this.caseStreamSub.unsubscribe();
          this.caseStreamSub = undefined;
        }
      },
    });
  }

  /**
   * Start the summary SSE stream once per session.
   * Requires an essayId and at least one selected case id from state.
   */
  private startSummaryStream(): void {
    const essayId = this.essayStateService.essayId();
    const caseIds = this.essayStateService.selectedCaseItemIds();

    if (!essayId) {
      this.toastService.error("Please create an essay first to start summary");
      return;
    }
    if (!caseIds || caseIds.length === 0) {
      this.toastService.error("Select at least one case to stream summary");
      return;
    }
    if (this.summaryStreamSub) {
      this.summaryStreamSub.unsubscribe();
      this.summaryStreamSub = undefined;
    }
    this.isLoadingSummary.set(true);
    // Reset completion marker when starting a new stream
    this.summaryCompleted.set(false);
    this.summaryStreamSub = this.essayService
      .streamSummary(essayId, caseIds)
      .subscribe({
        next: (item) => {
          this.hasLoadedContent = true;
          const current = this.summaryItems();
          this.summaryItems.set([...current, item as SummarySseItem]);
        },
        error: (err) => {
          console.error("Error while streaming summary:", err);
          this.toastService.error(
            "Failed to stream summary. Please try again.",
          );
          this.isLoadingSummary.set(false);
          if (this.summaryStreamSub) {
            this.summaryStreamSub.unsubscribe();
            this.summaryStreamSub = undefined;
          }
        },
        complete: () => {
          this.isLoadingSummary.set(false);
          this.summaryCompleted.set(true);
          if (this.summaryStreamSub) {
            this.summaryStreamSub.unsubscribe();
            this.summaryStreamSub = undefined;
          }
        },
      });
  }

  /**
   * Handle child request to generate full essay after summary completed.
   * Currently validates presence of essayId and shows a confirmation toast with word count.
   * Can be extended to call an API to generate the full essay.
   */
  onGenerateEssay(): void {
    // Only actionable for the summary card
    if (this.featureCard.id !== "summary") return;
    const essayId = this.essayStateService.essayId();
    if (!essayId) {
      this.toastService.error("Please create an essay first to generate essay");
      return;
    }
    // Open wordcount input modal
    this.openWordcountModal();
  }

  private openWordcountModal(): void {
    this.wordcountModalVisible.set(true);
  }

  onWordcountConfirmed(count: number): void {
    // Placeholder for API call; for now, just notify the user.
    this.toastService.success(`Generating essay with ${count} words...`);
  }
}
