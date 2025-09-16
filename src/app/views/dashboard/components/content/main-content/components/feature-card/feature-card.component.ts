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
import { catchError, of, Subscription } from "rxjs";
import {
  ArgumentData,
  ScholarData,
} from "@/app/interfaces/essay-create.interface";
import { ToastService } from "@/app/shared";
import { DashboardSharedService } from "../../../dashboard-shared.service";
import { Result } from "@/app/interfaces/result";
import { type ModelCaseVO } from "@/app/interfaces/model-case.interface";

@Component({
  selector: "app-feature-card",
  standalone: true,
  imports: [CommonModule, ExpandableContentComponent],
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

  // Loading state for casestudies stream (until first payload arrives)
  readonly isLoadingCases = signal<boolean>(false);

  // Accumulated stream items for case studies (appended upon each valid payload)
  private readonly caseItems = signal<ReadonlyArray<ModelCaseVO>>([]);
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
      if (
        isExpanded &&
        this.featureCard.id === "arguments" &&
        !this.hasLoadedContent
      ) {
        this.fetchArguments();
      }

      // If expanding references card, conditionally fetch scholars from API (only first time per session)
      if (
        isExpanded &&
        this.featureCard.id === "references" &&
        !this.hasLoadedContent
      ) {
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

      // If expanding casestudies card, start SSE stream
      if (isExpanded && this.featureCard.id === "casestudies") {
        const essayId = this.essayStateService.essayId();
        if (!essayId) {
          this.toastService.error(
            "Please create an essay first to start case studies",
          );
          return;
        }
        // Clean up previous stream before starting a new one
        if (this.caseStreamSub) {
          this.caseStreamSub.unsubscribe();
          this.caseStreamSub = undefined;
        }
        // Set loading until first payload arrives
        this.isLoadingCases.set(true);
        // Mark cases as opened to allow Undo visibility for casestudies
        this.hasOpenedCases.set(true);
        // Start streaming ModelCaseVO items; minimal trigger, add error/complete handling
        this.caseStreamSub = this.essayService
          .streamModelCases(essayId)
          .subscribe({
            next: (vo) => {
              // Append incoming payload to local items store
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

      // If collapsing casestudies card, stop SSE stream
      if (!isExpanded && this.featureCard.id === "casestudies") {
        if (this.caseStreamSub) {
          this.caseStreamSub.unsubscribe();
          this.caseStreamSub = undefined;
        }
        this.isLoadingCases.set(false);
        this.caseItems.set([]);
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

    if (this.featureCard.id === "arguments" && !this.hasLoadedContent) {
      this.fetchArguments();
    }

    if (this.featureCard.id === "references" && !this.hasLoadedContent) {
      const phase = this.essayStateService.currentPhase();
      const hasLocalScholars = this.fetchedScholars().length > 0;
      // Avoid re-fetch on undo-driven navigation back to references when data already exists
      if (phase === EssayCreationPhase.ARGUMENT_SELECTED || !hasLocalScholars) {
        this.fetchScholars();
      }
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
      // Return fetched arguments if available, otherwise return empty array
      return this.fetchedArguments();
    }
    return [];
  }

  get scholarsData(): ScholarData[] {
    if (this.featureCard.id === "references") {
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
    // Emit for parent listeners if any
    this.undoClicked.emit();

    const essayId = this.essayStateService.essayId();
    if (!essayId) {
      this.toastService.error("Please create an essay first to undo");
      return;
    }

    // Determine which card we're undoing and set loading accordingly
    if (this.featureCard.id === "arguments") {
      this.isLoadingArguments.set(true);
      this.essayStateService.setArgumentsLoading(true);
    } else if (this.featureCard.id === "references") {
      this.isLoadingScholars.set(true);
      this.essayStateService.setScholarsLoading(true);
    } else if (this.featureCard.id === "casestudies") {
      // No loading flags needed for undoing case studies -> references
    }

    this.essayService
      .undoAction(essayId)
      .pipe(
        catchError((error) => {
          console.error("Error performing undo:", error);
          this.isLoadingArguments.set(false);
          this.isLoadingScholars.set(false);
          this.essayStateService.setArgumentsLoading(false);
          this.essayStateService.setScholarsLoading(false);
          this.toastService.error("Failed to undo. Please try again.");
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
          // Clear loading flags
          this.isLoadingArguments.set(false);
          this.isLoadingScholars.set(false);
          this.essayStateService.setArgumentsLoading(false);
          this.essayStateService.setScholarsLoading(false);

          if (!response || response.code !== 1 || !response.data) {
            this.toastService.error("Invalid undo response from server");
            return;
          }

          // Capture phase before local state updates to decide UI transitions
          const previousPhase = this.essayStateService.currentPhase();

          const data = response.data;

          // Update local data stores based on which card initiated undo
          if (this.featureCard.id === "arguments") {
            // Show keywords from the new API response
            this.fetchedKeywords.set(parseKeywordsToData(data.keywords ?? ""));

            this.essayStateService.setSelectedKeywords([]);

            // Reset selected argument ids in state since we moved back
            this.essayStateService.setSelectedArgumentIds([]);
            // Revert phase ARGUMENT_SELECTED -> KEYWORDS_SELECTED
            this.essayStateService.revertToKeywordsSelectedAfterUndo();
          } else if (this.featureCard.id === "references") {
            // Move phase from scholars_selected -> argument_selected
            // and show arguments from the new API response
            const argumentsFromApi = Array.isArray(data.arguments)
              ? data.arguments
              : [];
            this.fetchedArguments.set(argumentsFromApi);

            this.essayStateService.setSelectedArgumentIds([]);
            // Clear selected scholars and revert to argument_selected
            this.essayStateService.setSelectedScholarIds([]);
            // Revert phase SCHOLARS_SELECTED -> ARGUMENT_SELECTED
            this.essayStateService.revertToArgumentSelectedAfterUndo();
          } else if (this.featureCard.id === "casestudies") {
            // Revert phase CASE_SELECTED -> SCHOLARS_SELECTED
            this.essayStateService.revertToScholarsSelectedAfterUndo();
            // Clear local opened flag when undoing out of case studies
            this.hasOpenedCases.set(false);
          }

          // Clear the loaded flag for the card we are undoing from,
          // so that when the user returns to it and expands again, it re-fetches.
          this.hasLoadedContent = false;

          // Enable redo on the previous-phase feature card globally
          // If undoing from arguments -> redo appears on keywords card
          // If undoing from references -> redo appears on arguments card
          const redoTarget =
            this.featureCard.id === "arguments"
              ? "keywords"
              : this.featureCard.id === "references"
                ? "arguments"
                : "references";
          this.essayStateService.setRedoState(redoTarget);
          this.lastUndoneCardId.set(redoTarget);

          // Expand/collapse feature cards based on the phase before undo completed
          // Also update sidebar selection to keep UI state consistent
          if (previousPhase === "argument_selected") {
            // Move back to keywords
            this.dashboardSharedService.selectTask("keywords");
          } else if (previousPhase === "scholars_selected") {
            // Move back to arguments
            this.dashboardSharedService.selectTask("arguments");
          } else if (previousPhase === "case_selected") {
            // Move back to references
            this.dashboardSharedService.selectTask("references");
          }
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
            this.essayStateService.advancePhaseAfterArgumentsFetchSuccess();
            // Select arguments so sidebar reflects the forward step
            this.dashboardSharedService.selectTask("arguments");
          } else if (redoTarget === "arguments") {
            // Move forward to scholars available again
            this.fetchedScholars.set([]);
            this.essayStateService.advancePhaseAfterScholarsFetchSuccess();
            // Select references so sidebar reflects the forward step
            this.dashboardSharedService.selectTask("references");
          } else if (redoTarget === "references") {
            // Move forward to case studies
            this.essayStateService.advancePhaseAfterCaseOpen();
            this.dashboardSharedService.selectTask("casestudies");
            // Mark cases as opened due to successful redo
            this.hasOpenedCases.set(true);
          }

          // consume redo state globally and locally
          this.essayStateService.clearRedoState();
          this.lastUndoneCardId.set(null);
        },
      );
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
      this.essayStateService.isScholarsLoading()
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
}
