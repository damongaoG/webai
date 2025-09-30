import { Injectable, signal, computed, inject } from "@angular/core";
import { ToastService } from "@/app/shared/services";
import {
  ArgumentData,
  ScholarData,
} from "@/app/interfaces/essay-create.interface";

// Essay creation phases
export enum EssayCreationPhase {
  NOT_STARTED = "not_started",
  TITLE_CREATED = "title_created",
  KEYWORDS_SELECTED = "keywords_selected",
  ARGUMENT_SELECTED = "argument_selected",
  SCHOLARS_SELECTED = "scholars_selected",
  CASE_SELECTED = "case_selected",
  SUMMARY_CONFIRMED = "summary_confirmed",
}

// Essay state interface
export interface EssayState {
  phase: EssayCreationPhase;
  title: string | null;
  essayId: string | null;
  selectedKeywords: string[];
  selectedArgumentIds: string[];
  selectedScholarIds: string[];
  selectedCaseItemIds: string[];
  /** Map from caseId -> selected resultIds */
  selectedCaseResultMap: Record<string, string[]>;
  isCreating: boolean;
  errorMessage: string | null;
  created: boolean;
}

// Essay interaction permissions
export interface EssayInteractionPermissions {
  allowKeywordsSelection: boolean;
  allowArgumentsInteraction: boolean;
  allowReferencesInteraction: boolean;
  allowCaseStudiesInteraction: boolean;
}

@Injectable({
  providedIn: "root",
})
export class EssayStateService {
  private readonly toastService = inject(ToastService);
  // Initial state
  private readonly initialState: EssayState = {
    phase: EssayCreationPhase.NOT_STARTED,
    title: null,
    essayId: null,
    selectedKeywords: [],
    selectedArgumentIds: [],
    selectedScholarIds: [],
    selectedCaseItemIds: [],
    selectedCaseResultMap: {},
    isCreating: false,
    errorMessage: null,
    created: false,
  };

  // Signal-based state management for better reactivity
  private readonly _currentPhase = signal(this.initialState.phase);
  private readonly _essayTitle = signal(this.initialState.title);
  private readonly _essayId = signal(this.initialState.essayId);
  private readonly _selectedKeywords = signal(
    this.initialState.selectedKeywords,
  );
  private readonly _selectedArgumentIds = signal<string[]>(
    this.initialState.selectedArgumentIds,
  );
  private readonly _selectedScholarIds = signal<string[]>(
    this.initialState.selectedScholarIds,
  );
  private readonly _selectedCaseItemIds = signal<string[]>(
    this.initialState.selectedCaseItemIds,
  );
  private readonly _selectedCaseResultMap = signal<Record<string, string[]>>(
    this.initialState.selectedCaseResultMap,
  );
  private readonly _isCreating = signal(this.initialState.isCreating);
  private readonly _errorMessage = signal(this.initialState.errorMessage);
  private readonly _created = signal(this.initialState.created);
  private readonly _isLoadingArguments = signal(false);
  private readonly _isLoadingScholars = signal(false);
  private readonly _redoAvailable = signal(false);
  private readonly _redoTargetCardId = signal<string | null>(null);
  // Shared caches for available data to avoid redundant fetches across cards
  private readonly _availableArguments = signal<ArgumentData[]>([]);
  private readonly _availableScholars = signal<ScholarData[]>([]);

  // Public computed signals for component consumption
  public readonly essayTitle = computed(() => this._essayTitle());
  public readonly essayId = computed(() => this._essayId());
  public readonly selectedKeywords = computed(() => this._selectedKeywords());
  public readonly selectedArgumentIds = computed(() =>
    this._selectedArgumentIds(),
  );
  public readonly selectedScholarIds = computed(() =>
    this._selectedScholarIds(),
  );
  public readonly selectedCaseItemIds = computed(() =>
    this._selectedCaseItemIds(),
  );
  public readonly selectedCaseResultMap = computed(() =>
    this._selectedCaseResultMap(),
  );
  public readonly isArgumentsLoading = computed(() =>
    this._isLoadingArguments(),
  );
  public readonly isScholarsLoading = computed(() => this._isLoadingScholars());
  public readonly currentPhase = computed(() => this._currentPhase());
  public readonly redoTargetCardId = computed(() => this._redoTargetCardId());
  public readonly availableArguments = computed(() =>
    this._availableArguments(),
  );
  public readonly availableScholars = computed(() => this._availableScholars());

  // Computed permissions based on current state - now properly reactive to phase changes
  public readonly interactionPermissions = computed(() => {
    const currentState: EssayState = {
      phase: this._currentPhase(),
      title: this._essayTitle(),
      essayId: this._essayId(),
      selectedKeywords: this._selectedKeywords(),
      selectedArgumentIds: this._selectedArgumentIds(),
      selectedScholarIds: this._selectedScholarIds(),
      selectedCaseItemIds: this._selectedCaseItemIds(),
      selectedCaseResultMap: this._selectedCaseResultMap(),
      isCreating: this._isCreating(),
      errorMessage: this._errorMessage(),
      created: this._created(),
    };
    console.log("Current state:", currentState);
    return this.calculatePermissions(currentState);
  });

  /**
   * Set creating state for loading indicators
   */
  setCreating(isCreating: boolean): void {
    this._isCreating.set(isCreating);
    if (isCreating) {
      this._errorMessage.set(null);
    }
  }

  /**
   * Set arguments loading state
   */
  setArgumentsLoading(isLoading: boolean): void {
    this._isLoadingArguments.set(isLoading);
  }

  /**
   * Set scholars loading state
   */
  setScholarsLoading(isLoading: boolean): void {
    this._isLoadingScholars.set(isLoading);
  }

  /**
   * Revert phase from ARGUMENT_SELECTED -> KEYWORDS_SELECTED (used on undo)
   */
  revertToKeywordsSelectedAfterUndo(): void {
    if (this._currentPhase() === EssayCreationPhase.ARGUMENT_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.KEYWORDS_SELECTED);
    }
  }

  /**
   * Revert phase from SCHOLARS_SELECTED -> ARGUMENT_SELECTED (used on undo)
   */
  revertToArgumentSelectedAfterUndo(): void {
    if (this._currentPhase() === EssayCreationPhase.SCHOLARS_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.ARGUMENT_SELECTED);
    }
  }

  /**
   * Revert phase from CASE_SELECTED -> SCHOLARS_SELECTED (used on undo from casestudies)
   */
  revertToScholarsSelectedAfterUndo(): void {
    if (this._currentPhase() === EssayCreationPhase.CASE_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.SCHOLARS_SELECTED);
      this._selectedScholarIds.set([]);
    }
  }

  /**
   * Revert phase from SUMMARY_CONFIRMED -> CASE_SELECTED (used on undo from summary)
   */
  revertToCaseSelectedAfterSummaryUndo(): void {
    if (this._currentPhase() === EssayCreationPhase.SUMMARY_CONFIRMED) {
      this._currentPhase.set(EssayCreationPhase.CASE_SELECTED);
      this._selectedCaseItemIds.set([]);
      // Clear any selected case results to fully reset casestudies selections
      this._selectedCaseResultMap.set({});
    }
  }

  /**
   * Pre-advance phase when performing a redo action.
   * - TITLE_CREATED -> KEYWORDS_SELECTED
   * - KEYWORDS_SELECTED -> ARGUMENT_SELECTED
   * Other phases are left unchanged here on purpose.
   */
  preAdvancePhaseForRedo(): void {
    const phase = this._currentPhase();
    switch (phase) {
      case EssayCreationPhase.TITLE_CREATED: {
        this._currentPhase.set(EssayCreationPhase.KEYWORDS_SELECTED);
        break;
      }
      case EssayCreationPhase.KEYWORDS_SELECTED: {
        this._currentPhase.set(EssayCreationPhase.ARGUMENT_SELECTED);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Advance to CASE_SELECTED after opening/continuing case studies (used on redo to casestudies)
   */
  advancePhaseAfterCaseOpen(): void {
    if (this._currentPhase() === EssayCreationPhase.SCHOLARS_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.CASE_SELECTED);
    }
  }

  /**
   * Configure redo availability for a specific feature card id
   * (e.g., "keywords" when undoing from arguments, or "arguments" when undoing from references)
   */
  setRedoState(targetCardId: string): void {
    this._redoTargetCardId.set(targetCardId);
    this._redoAvailable.set(true);
  }

  /**
   * Clear redo availability
   */
  clearRedoState(): void {
    this._redoTargetCardId.set(null);
    this._redoAvailable.set(false);
  }

  /**
   * Update shared caches for available data
   */
  setAvailableArguments(args: ArgumentData[]): void {
    this._availableArguments.set(Array.isArray(args) ? args : []);
  }

  clearAvailableArguments(): void {
    this._availableArguments.set([]);
  }

  setAvailableScholars(scholars: ScholarData[]): void {
    this._availableScholars.set(Array.isArray(scholars) ? scholars : []);
  }

  clearAvailableScholars(): void {
    this._availableScholars.set([]);
  }

  /**
   * Whether redo is available for a given feature card id
   */
  isRedoAvailableForCard(cardId: string): boolean {
    return this._redoAvailable() && this._redoTargetCardId() === cardId;
  }

  /**
   * Advance to ARGUMENT_SELECTED after successful arguments fetch
   * Locks keywords interactions as required by the flow.
   */
  advancePhaseAfterArgumentsFetchSuccess(): void {
    if (this._currentPhase() === EssayCreationPhase.KEYWORDS_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.ARGUMENT_SELECTED);
    }
  }

  /**
   * Advance to SCHOLARS_SELECTED after successful scholars fetch
   * Locks arguments interactions as required by the flow.
   */
  advancePhaseAfterScholarsFetchSuccess(): void {
    if (this._currentPhase() === EssayCreationPhase.ARGUMENT_SELECTED) {
      this._currentPhase.set(EssayCreationPhase.SCHOLARS_SELECTED);
    }
  }

  /**
   * Set essay title and ID, move to TITLE_CREATED phase
   */
  setEssayTitle(title: string, essayId?: string): void {
    this._essayTitle.set(title);
    if (essayId) {
      this._essayId.set(essayId);
    }
    this._currentPhase.set(EssayCreationPhase.TITLE_CREATED);
    this._isCreating.set(false);
    this._errorMessage.set(null);
    this._created.set(true);
  }

  /**
   * Set selected keywords and move to KEYWORDS_SELECTED phase
   */
  setSelectedKeywords(keywords: string[]): void {
    // Only allow keyword selection if we're in TITLE_CREATED phase or later
    if (this._currentPhase() === EssayCreationPhase.NOT_STARTED) {
      console.warn("Cannot select keywords before essay title is created");
      return;
    }

    // Determine the new phase based on keywords length
    const newPhase =
      keywords.length > 0
        ? EssayCreationPhase.KEYWORDS_SELECTED
        : EssayCreationPhase.TITLE_CREATED;

    this._selectedKeywords.set(keywords);
    this._currentPhase.set(newPhase);
  }

  /**
   * Set selected argument ids and update phase accordingly
   */
  setSelectedArgumentIds(argumentIds: string[]): void {
    // Only allow argument interaction if we're in KEYWORDS_SELECTED phase or later
    if (
      this._currentPhase() === EssayCreationPhase.NOT_STARTED ||
      this._currentPhase() === EssayCreationPhase.TITLE_CREATED
    ) {
      console.warn("Cannot select arguments before keywords are selected");
      return;
    }

    // Always update the selected argument ids
    this._selectedArgumentIds.set(argumentIds);

    const currentPhase = this._currentPhase();

    // Do not move backwards once we've advanced beyond arguments
    if (currentPhase === EssayCreationPhase.SCHOLARS_SELECTED) {
      return;
    }

    // If we are still at keywords stage and user selects arguments, advance
    if (
      currentPhase === EssayCreationPhase.KEYWORDS_SELECTED &&
      argumentIds.length > 0
    ) {
      this._currentPhase.set(EssayCreationPhase.ARGUMENT_SELECTED);
      return;
    }

    // If already at ARGUMENT_SELECTED, keep phase even if selection becomes empty
    // Permissions will gate access to references based on selection length.
    if (currentPhase === EssayCreationPhase.ARGUMENT_SELECTED) {
      return;
    }
  }

  /**
   * Set selected scholar ids and update phase accordingly
   */
  setSelectedScholarIds(scholarIds: string[]): void {
    // References can only be interacted with once arguments have been selected
    if (
      this._currentPhase() === EssayCreationPhase.NOT_STARTED ||
      this._currentPhase() === EssayCreationPhase.TITLE_CREATED
    ) {
      console.warn("Cannot select references before arguments are selected");
      return;
    }

    const hasScholars = scholarIds.length > 0;
    const fallbackPhase = EssayCreationPhase.SCHOLARS_SELECTED;

    const nextPhase = hasScholars
      ? EssayCreationPhase.CASE_SELECTED
      : fallbackPhase;

    this._selectedScholarIds.set(scholarIds);
    this._currentPhase.set(nextPhase);
  }

  /**
   * Set selected case item ids and advance to SUMMARY when any selected;
   * otherwise stay/return to CASE_SELECTED.
   */
  setSelectedCaseItemIds(ids: string[]): void {
    // Cases can only be interacted with once scholars have been selected
    if (
      this._currentPhase() === EssayCreationPhase.NOT_STARTED ||
      this._currentPhase() === EssayCreationPhase.TITLE_CREATED ||
      this._currentPhase() === EssayCreationPhase.KEYWORDS_SELECTED ||
      this._currentPhase() === EssayCreationPhase.ARGUMENT_SELECTED
    ) {
      console.warn("Cannot select case studies before references are selected");
      return;
    }

    const hasCases = ids.length > 0;
    const nextPhase = hasCases
      ? EssayCreationPhase.SUMMARY_CONFIRMED
      : EssayCreationPhase.CASE_SELECTED;

    this._selectedCaseItemIds.set(ids);
    this._currentPhase.set(nextPhase);
  }

  /** Add a single case id immutably */
  addSelectedCaseItemId(id: string): void {
    const current = this._selectedCaseItemIds();
    if (current.includes(id)) return;
    this.setSelectedCaseItemIds([...current, id]);
  }

  /** Remove a single case id immutably */
  removeSelectedCaseItemId(id: string): void {
    const current = this._selectedCaseItemIds();
    if (current.length === 0) return;
    const next = current.filter((i) => i !== id);
    this.setSelectedCaseItemIds(next);
  }

  /** Replace selected result ids for a specific case id */
  setSelectedResultIdsForCase(caseId: string, resultIds: string[]): void {
    const current = this._selectedCaseResultMap();
    const next: Record<string, string[]> = {
      ...current,
      [caseId]: [...resultIds],
    };
    this._selectedCaseResultMap.set(next);
  }

  /** Add a single result id for a case */
  addSelectedResultId(caseId: string, resultId: string): void {
    const current = this._selectedCaseResultMap();
    const list = current[caseId] ?? [];
    if (list.includes(resultId)) return;
    this.setSelectedResultIdsForCase(caseId, [...list, resultId]);
    // Ensure the parent case is selected when any result is selected
    const selectedCases = this._selectedCaseItemIds();
    if (!selectedCases.includes(caseId)) {
      this.addSelectedCaseItemId(caseId);
    }
  }

  /** Remove a single result id for a case */
  removeSelectedResultId(caseId: string, resultId: string): void {
    const current = this._selectedCaseResultMap();
    const list = current[caseId] ?? [];
    if (list.length === 0) return;
    const nextList = list.filter((id) => id !== resultId);
    this.setSelectedResultIdsForCase(caseId, nextList);
    // If no results remain for this case, remove the parent case selection
    if (nextList.length === 0) {
      const selectedCases = this._selectedCaseItemIds();
      if (selectedCases.includes(caseId)) {
        this.removeSelectedCaseItemId(caseId);
      }
    }
  }

  /**
   * Add a single keyword to selectedKeywords immutably
   */
  addSelectedKeyword(keyword: string): void {
    const current = this._selectedKeywords();
    if (current.includes(keyword)) {
      return;
    }
    this.setSelectedKeywords([...current, keyword]);
  }

  /**
   * Remove a single keyword from selectedKeywords immutably
   */
  removeSelectedKeyword(keyword: string): void {
    const current = this._selectedKeywords();
    if (current.length === 0) {
      return;
    }
    const next = current.filter((k) => k !== keyword);
    this.setSelectedKeywords(next);
  }

  /**
   * Add a single argument id to selectedArgumentIds immutably
   */
  addSelectedArgumentId(argumentId: string): void {
    const current = this._selectedArgumentIds();
    if (current.includes(argumentId)) {
      return;
    }
    this.setSelectedArgumentIds([...current, argumentId]);
  }

  /**
   * Remove a single argument id from selectedArgumentIds immutably
   */
  removeSelectedArgumentId(argumentId: string): void {
    const current = this._selectedArgumentIds();
    if (current.length === 0) {
      return;
    }
    const next = current.filter((id) => id !== argumentId);
    this.setSelectedArgumentIds(next);
  }

  /**
   * Add a single scholar id to selectedScholarIds immutably
   */
  addSelectedScholarId(scholarId: string): void {
    const current = this._selectedScholarIds();
    if (current.includes(scholarId)) {
      return;
    }
    this.setSelectedScholarIds([...current, scholarId]);
  }

  /**
   * Remove a single scholar id from selectedScholarIds immutably
   */
  removeSelectedScholarId(scholarId: string): void {
    const current = this._selectedScholarIds();
    if (current.length === 0) {
      return;
    }
    const next = current.filter((id) => id !== scholarId);
    this.setSelectedScholarIds(next);
  }

  /**
   * Reset essay state to initial state
   */
  resetState(): void {
    this._currentPhase.set(this.initialState.phase);
    this._essayTitle.set(this.initialState.title);
    this._essayId.set(this.initialState.essayId);
    this._selectedKeywords.set(this.initialState.selectedKeywords);
    this._selectedArgumentIds.set(this.initialState.selectedArgumentIds);
    this._selectedScholarIds.set(this.initialState.selectedScholarIds);
    this._selectedCaseItemIds.set(this.initialState.selectedCaseItemIds);
    this._selectedCaseResultMap.set({});
    this._isCreating.set(this.initialState.isCreating);
    this._errorMessage.set(this.initialState.errorMessage);
    this._created.set(this.initialState.created);
    this._isLoadingArguments.set(false);
    this._isLoadingScholars.set(false);
    this._redoTargetCardId.set(null);
    this._redoAvailable.set(false);
    this._availableArguments.set([]);
    this._availableScholars.set([]);
  }

  /**
   * Set error state
   */
  setError(errorMessage: string): void {
    this._isCreating.set(false);
    this._errorMessage.set(errorMessage);
    this._created.set(false);
    this.toastService.error(errorMessage);
  }

  /**
   * Check if a specific interaction is allowed
   */
  isInteractionAllowed(contentType: string): boolean {
    const permissions = this.interactionPermissions();

    switch (contentType) {
      case "keywords":
        return permissions.allowKeywordsSelection;
      case "arguments":
        return permissions.allowArgumentsInteraction;
      case "references":
        return permissions.allowReferencesInteraction;
      case "casestudies":
        return permissions.allowCaseStudiesInteraction;
      case "summary":
        // Summary interaction should only be available when the flow reaches summary_confirmed
        return this._currentPhase() === EssayCreationPhase.SUMMARY_CONFIRMED;
      default:
        return false;
    }
  }

  /**
   * Calculate interaction permissions based on current state
   */
  private calculatePermissions(state: EssayState): EssayInteractionPermissions {
    const { phase } = state;

    switch (phase) {
      case EssayCreationPhase.NOT_STARTED:
        return {
          allowKeywordsSelection: false,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.TITLE_CREATED:
        return {
          allowKeywordsSelection: true,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.KEYWORDS_SELECTED:
        return {
          allowKeywordsSelection: true,
          allowArgumentsInteraction: true,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.ARGUMENT_SELECTED:
        return {
          allowKeywordsSelection: false,
          // Keep arguments interaction enabled until scholars are successfully fetched
          allowArgumentsInteraction: true,
          // Only allow references once user selected at least one argument
          allowReferencesInteraction: state.selectedArgumentIds.length > 0,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.SCHOLARS_SELECTED:
        return {
          allowKeywordsSelection: false,
          // After scholars fetched, prevent interacting with arguments
          allowArgumentsInteraction: false,
          // Keep references accessible for review
          allowReferencesInteraction: true,
          // Allow case studies only when there is at least one selected scholar
          allowCaseStudiesInteraction: state.selectedScholarIds.length > 0,
        };

      case EssayCreationPhase.CASE_SELECTED:
        return {
          allowKeywordsSelection: false,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: true,
        };

      case EssayCreationPhase.SUMMARY_CONFIRMED:
        return {
          allowKeywordsSelection: false,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      default:
        return {
          allowKeywordsSelection: true,
          allowArgumentsInteraction: true,
          allowReferencesInteraction: true,
          allowCaseStudiesInteraction: true,
        };
    }
  }
}
