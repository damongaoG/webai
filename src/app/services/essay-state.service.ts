import { Injectable, signal, computed, inject } from "@angular/core";
import { ToastService } from "@/app/shared/services";

// Essay creation phases
export enum EssayCreationPhase {
  NOT_STARTED = "not_started",
  TITLE_CREATED = "title_created",
  KEYWORDS_SELECTED = "keywords_selected",
  ARGUMENT_SELECTED = "argument_selected",
  SCHOLARS_SELECTED = "scholars_selected",
  CASE_SELECTED = "case_selected",
}

// Essay state interface
export interface EssayState {
  phase: EssayCreationPhase;
  title: string | null;
  essayId: string | null;
  selectedKeywords: string[];
  selectedArgumentIds: string[];
  selectedScholarIds: string[];
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
  private readonly _isCreating = signal(this.initialState.isCreating);
  private readonly _errorMessage = signal(this.initialState.errorMessage);
  private readonly _created = signal(this.initialState.created);
  private readonly _isLoadingArguments = signal(false);
  private readonly _isLoadingScholars = signal(false);
  private readonly _redoAvailable = signal(false);
  private readonly _redoTargetCardId = signal<string | null>(null);

  // Public computed signals for component consumption
  public readonly essayId = computed(() => this._essayId());
  public readonly selectedKeywords = computed(() => this._selectedKeywords());
  public readonly selectedArgumentIds = computed(() =>
    this._selectedArgumentIds(),
  );
  public readonly selectedScholarIds = computed(() =>
    this._selectedScholarIds(),
  );
  public readonly isArgumentsLoading = computed(() =>
    this._isLoadingArguments(),
  );
  public readonly isScholarsLoading = computed(() => this._isLoadingScholars());
  public readonly currentPhase = computed(() => this._currentPhase());
  public readonly redoTargetCardId = computed(() => this._redoTargetCardId());

  // Computed permissions based on current state - now properly reactive to phase changes
  public readonly interactionPermissions = computed(() => {
    const currentState: EssayState = {
      phase: this._currentPhase(),
      title: this._essayTitle(),
      essayId: this._essayId(),
      selectedKeywords: this._selectedKeywords(),
      selectedArgumentIds: this._selectedArgumentIds(),
      selectedScholarIds: this._selectedScholarIds(),
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
    const fallbackPhase = EssayCreationPhase.ARGUMENT_SELECTED;

    const nextPhase = hasScholars
      ? EssayCreationPhase.CASE_SELECTED
      : fallbackPhase;

    this._selectedScholarIds.set(scholarIds);
    this._currentPhase.set(nextPhase);
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
    this._isCreating.set(this.initialState.isCreating);
    this._errorMessage.set(this.initialState.errorMessage);
    this._created.set(this.initialState.created);
    this._isLoadingArguments.set(false);
    this._isLoadingScholars.set(false);
    this._redoTargetCardId.set(null);
    this._redoAvailable.set(false);
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
          allowReferencesInteraction: true,
          allowCaseStudiesInteraction: true,
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
