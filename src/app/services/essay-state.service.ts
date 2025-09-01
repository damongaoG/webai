import { Injectable, signal, computed } from "@angular/core";

// Essay creation phases
export enum EssayCreationPhase {
  NOT_STARTED = "not_started",
  TITLE_CREATED = "title_created",
  KEYWORDS_SELECTED = "keywords_selected",
  ARGUMENT_SELECTED = "argument_selected",
}

// Essay state interface
export interface EssayState {
  phase: EssayCreationPhase;
  title: string | null;
  essayId: string | null;
  selectedKeywords: string[];
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
  // Initial state
  private readonly initialState: EssayState = {
    phase: EssayCreationPhase.NOT_STARTED,
    title: null,
    essayId: null,
    selectedKeywords: [],
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
  private readonly _isCreating = signal(this.initialState.isCreating);
  private readonly _errorMessage = signal(this.initialState.errorMessage);
  private readonly _created = signal(this.initialState.created);
  private readonly _isLoadingArguments = signal(false);

  // Public computed signals for component consumption
  public readonly currentPhase = computed(() => this._currentPhase());
  public readonly essayTitle = computed(() => this._essayTitle());
  public readonly essayId = computed(() => this._essayId());
  public readonly selectedKeywords = computed(() => this._selectedKeywords());
  public readonly isCreatingEssay = computed(() => this._isCreating());
  public readonly errorMessage = computed(() => this._errorMessage());
  public readonly created = computed(() => this._created());
  public readonly isLoadingArguments = computed(() =>
    this._isLoadingArguments(),
  );

  // Computed permissions based on current state - now properly reactive to phase changes
  public readonly interactionPermissions = computed(() => {
    const currentState: EssayState = {
      phase: this._currentPhase(),
      title: this._essayTitle(),
      essayId: this._essayId(),
      selectedKeywords: this._selectedKeywords(),
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
   * Move to ARGUMENT_SELECTED phase
   * This should be called when arguments have been selected/configured
   */
  setArgumentSelected(): void {
    // Only allow argument selection if we're in KEYWORDS_SELECTED phase or later
    if (
      this._currentPhase() === EssayCreationPhase.NOT_STARTED ||
      this._currentPhase() === EssayCreationPhase.TITLE_CREATED
    ) {
      console.warn("Cannot select arguments before keywords are selected");
      return;
    }

    this._currentPhase.set(EssayCreationPhase.ARGUMENT_SELECTED);
  }

  /**
   * Reset essay state to initial state
   */
  resetState(): void {
    this._currentPhase.set(this.initialState.phase);
    this._essayTitle.set(this.initialState.title);
    this._essayId.set(this.initialState.essayId);
    this._selectedKeywords.set(this.initialState.selectedKeywords);
    this._isCreating.set(this.initialState.isCreating);
    this._errorMessage.set(this.initialState.errorMessage);
    this._created.set(this.initialState.created);
    this._isLoadingArguments.set(false);
  }

  /**
   * Set error state
   */
  setError(errorMessage: string): void {
    this._isCreating.set(false);
    this._errorMessage.set(errorMessage);
    this._created.set(false);
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
          allowKeywordsSelection: true,
          allowArgumentsInteraction: true,
          allowReferencesInteraction: true,
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
