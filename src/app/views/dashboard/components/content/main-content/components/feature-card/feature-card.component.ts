import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
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
import { EssayStateService } from "@/app/services/essay-state.service";
import { EssayService } from "@/app/services/essay.service";
import { parseKeywordsToData } from "@/app/helper/utils";
import { catchError, of } from "rxjs";
import {
  ArgumentData,
  ScholarData,
} from "@/app/interfaces/essay-create.interface";
import { ToastService } from "@/app/shared";

@Component({
  selector: "app-feature-card",
  standalone: true,
  imports: [CommonModule, ExpandableContentComponent],
  templateUrl: "./feature-card.component.html",
  styleUrl: "./feature-card.component.scss",
})
export class FeatureCardComponent {
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

  private taskSelectionService = inject(TaskSelectionService);
  private readonly essayStateService = inject(EssayStateService);
  private readonly essayService = inject(EssayService);
  private readonly toastService = inject(ToastService);

  // Signal to store fetched keywords
  private readonly fetchedKeywords = signal<KeywordData[]>([]);
  readonly isLoadingKeywords = signal<boolean>(false);

  // Signal to store fetched arguments
  private readonly fetchedArguments = signal<ArgumentData[]>([]);
  readonly isLoadingArguments = signal<boolean>(false);

  // Signal to store fetched scholars (references)
  private readonly fetchedScholars = signal<ScholarData[]>([]);
  readonly isLoadingScholars = signal<boolean>(false);

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

      // If expanding keywords card, fetch keywords from API
      if (isExpanded && this.featureCard.id === "keywords") {
        this.fetchKeywords();
      }

      // If expanding arguments card, fetch arguments from API
      if (isExpanded && this.featureCard.id === "arguments") {
        this.fetchArguments();
      }

      // If expanding references card, fetch scholars from API
      if (isExpanded && this.featureCard.id === "references") {
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
    return false;
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
      .subscribe((response) => {
        // Clear loading flags
        this.isLoadingArguments.set(false);
        this.isLoadingScholars.set(false);
        this.essayStateService.setArgumentsLoading(false);
        this.essayStateService.setScholarsLoading(false);

        if (!response || response.code !== 1 || !response.data) {
          this.toastService.error("Invalid undo response from server");
          return;
        }

        const data = response.data;

        // Update local data stores based on which card initiated undo
        if (this.featureCard.id === "arguments") {
          // Show keywords from the new API response
          this.fetchedKeywords.set(parseKeywordsToData(data.keywords ?? ""));
          // Reset selected argument ids in state since we moved back
          this.essayStateService.setSelectedArgumentIds([]);
          // Move phase back to keywords_selected by updating selected keywords
          const parsedKeywords = (data.keywords ?? "")
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k.length > 0);
          this.essayStateService.setSelectedKeywords(parsedKeywords);
        } else if (this.featureCard.id === "references") {
          // Move phase from scholars_selected -> argument_selected
          // and show arguments from the new API response
          const argumentsFromApi = Array.isArray(data.arguments)
            ? data.arguments
            : [];
          this.fetchedArguments.set(argumentsFromApi);
          // Clear selected scholars and revert to argument_selected
          this.essayStateService.setSelectedScholarIds([]);
          // Ensure we're at ARGUMENT_SELECTED without advancing beyond
          const currentArgIds = this.essayStateService.selectedArgumentIds();
          // Keep current argument selection if still valid; otherwise empty
          const validIds = new Set(argumentsFromApi.map((a) => a.id));
          const filtered = currentArgIds.filter((id) => validIds.has(id));
          this.essayStateService.setSelectedArgumentIds(filtered);
        }
      });
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
      default:
        return false;
    }
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
          } else {
            console.warn("Invalid scholars response:", response);
            this.toastService.error("Invalid references response from server");
          }
        },
      });
  }
}
