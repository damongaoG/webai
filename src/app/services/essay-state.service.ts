import { Injectable, signal, computed } from "@angular/core";
import { BehaviorSubject } from "rxjs";

// Essay creation phases
export enum EssayCreationPhase {
  NOT_STARTED = "not_started",
  TITLE_CREATED = "title_created",
  KEYWORDS_SELECTED = "keywords_selected",
}

// Essay state interface
export interface EssayState {
  phase: EssayCreationPhase;
  title: string | null;
  selectedKeywords: string[];
  isCreating: boolean;
  errorMessage: string | null;
  created: boolean;
}

// Essay interaction permissions
export interface EssayInteractionPermissions {
  allowKeywordsSelection: boolean;
  allowAssignmentInteraction: boolean;
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
    selectedKeywords: [],
    isCreating: false,
    errorMessage: null,
    created: false,
  };

  // State management using BehaviorSubject for reactive patterns
  private readonly essayStateSubject = new BehaviorSubject<EssayState>(
    this.initialState,
  );

  // Public observable for component consumption
  // Computed permissions based on current state
  public readonly interactionPermissions = computed(() => {
    const currentState = this.essayStateSubject.value;
    console.log("Current state:", currentState);
    return this.calculatePermissions(currentState);
  });

  // Signal-based getters for reactive UI
  public readonly currentPhase = signal(this.initialState.phase);
  public readonly essayTitle = signal(this.initialState.title);
  public readonly isCreatingEssay = signal(this.initialState.isCreating);

  /**
   * Set creating state for loading indicators
   */
  setCreating(isCreating: boolean): void {
    const currentState = this.essayStateSubject.value;
    const newState: EssayState = {
      ...currentState,
      isCreating,
      errorMessage: isCreating ? null : currentState.errorMessage,
    };

    this.updateState(newState);
    this.isCreatingEssay.set(isCreating);
  }

  /**
   * Set essay title and move to TITLE_CREATED phase
   */
  setEssayTitle(title: string): void {
    const currentState = this.essayStateSubject.value;
    const newState: EssayState = {
      ...currentState,
      title,
      phase: EssayCreationPhase.TITLE_CREATED,
      isCreating: false,
      errorMessage: null,
      created: true,
    };

    this.updateState(newState);
    this.essayTitle.set(title);
    this.currentPhase.set(EssayCreationPhase.TITLE_CREATED);
    this.isCreatingEssay.set(false);
  }

  /**
   * Set selected keywords and move to KEYWORDS_SELECTED phase
   */
  setSelectedKeywords(keywords: string[]): void {
    const currentState = this.essayStateSubject.value;

    // Only allow keyword selection if we're in TITLE_CREATED phase or later
    if (currentState.phase === EssayCreationPhase.NOT_STARTED) {
      console.warn("Cannot select keywords before essay title is created");
      return;
    }

    const newState: EssayState = {
      ...currentState,
      selectedKeywords: keywords,
      phase:
        keywords.length > 0
          ? EssayCreationPhase.KEYWORDS_SELECTED
          : EssayCreationPhase.TITLE_CREATED,
    };

    this.updateState(newState);

    if (keywords.length > 0) {
      this.currentPhase.set(EssayCreationPhase.KEYWORDS_SELECTED);
    }
  }

  /**
   * Reset essay state to initial state
   */
  resetState(): void {
    this.updateState(this.initialState);
    this.currentPhase.set(this.initialState.phase);
    this.essayTitle.set(this.initialState.title);
    this.isCreatingEssay.set(this.initialState.isCreating);
  }

  /**
   * Set error state
   */
  setError(errorMessage: string): void {
    const currentState = this.essayStateSubject.value;
    const newState: EssayState = {
      ...currentState,
      isCreating: false,
      errorMessage,
      created: false,
    };

    this.updateState(newState);
    this.isCreatingEssay.set(false);
  }

  /**
   * Check if a specific interaction is allowed
   */
  isInteractionAllowed(contentType: string): boolean {
    const permissions = this.interactionPermissions();

    switch (contentType) {
      case "keywords":
        return permissions.allowKeywordsSelection;
      case "assignment":
        return permissions.allowAssignmentInteraction;
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
          allowAssignmentInteraction: false,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.TITLE_CREATED:
        return {
          allowKeywordsSelection: true, // Only allow if essay was successfully created
          allowAssignmentInteraction: false,
          allowArgumentsInteraction: false,
          allowReferencesInteraction: false,
          allowCaseStudiesInteraction: false,
        };

      case EssayCreationPhase.KEYWORDS_SELECTED:
        return {
          allowKeywordsSelection: true,
          allowAssignmentInteraction: true,
          allowArgumentsInteraction: true,
          allowReferencesInteraction: true,
          allowCaseStudiesInteraction: true,
        };

      default:
        return {
          allowKeywordsSelection: true,
          allowAssignmentInteraction: true,
          allowArgumentsInteraction: true,
          allowReferencesInteraction: true,
          allowCaseStudiesInteraction: true,
        };
    }
  }

  /**
   * Update state and emit changes
   */
  private updateState(newState: EssayState): void {
    console.log("Updating state:", newState);
    this.essayStateSubject.next(newState);
  }
}
