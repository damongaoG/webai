import { Component, effect, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";
import { FeatureCardComponent } from "./components/feature-card/feature-card.component";
import {
  CardId,
  CardState,
  FeatureCard,
} from "./interfaces/feature-card.interface";
import { KeywordData } from "./interfaces/keyword.interface";
import { TaskType } from "@/app/interfaces/task.interface";
import { EssayStateService } from "@/app/services/essay-state.service";

@Component({
  selector: "app-main-content",
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FeatureCardComponent],
  templateUrl: "./main-content.component.html",
  styleUrl: "./main-content.component.scss",
})
export class MainContentComponent implements OnInit {
  dashboardService = inject(DashboardSharedService);
  private readonly essayStateService = inject(EssayStateService);

  constructor() {
    // Listen to shared service expandable state changes
    effect(() => {
      const sharedState = this.dashboardService.getExpandableState()();
      this.syncWithSharedState(sharedState);
    });
  }

  ngOnInit(): void {
    // Initial sync with shared service state
    const sharedState = this.dashboardService.getExpandableState()();
    this.syncWithSharedState(sharedState);
  }

  // Configuration for all feature cards with task types
  featureCards: (FeatureCard & { taskType: TaskType })[] = [
    {
      id: "keywords",
      title: "Keywords",
      iconPath: "/assets/images/icon/dark-keyword.svg",
      iconAlt: "Keywords icon",
      taskType: TaskType.KEYWORD,
    },
    {
      id: "assignment",
      title: "Assignment task",
      iconPath: "/assets/images/icon/dark-task.svg",
      iconAlt: "Assignment task icon",
      taskType: TaskType.CONTENT,
    },
    {
      id: "arguments",
      title: "Use arguments",
      iconPath: "/assets/images/icon/dark-argument-point.svg",
      iconAlt: "Use arguments icon",
      taskType: TaskType.STYLE,
    },
    {
      id: "references",
      title: "References",
      iconPath: "/assets/images/icon/dark-review.svg",
      iconAlt: "References icon",
      taskType: TaskType.GRAMMAR,
    },
    {
      id: "casestudies",
      title: "Relevant case studies",
      iconPath: "/assets/images/icon/dark-case.svg",
      iconAlt: "Case studies icon",
      taskType: TaskType.TONE,
    },
  ];

  // State management for each card's gradient visibility
  cardStates: Record<CardId, CardState> = {
    keywords: {
      showGradient: false,
      isPersistent: false,
      expandable: {
        isExpanded: false,
        contentType: null,
        animating: false,
      },
    },
    assignment: {
      showGradient: false,
      isPersistent: false,
      expandable: {
        isExpanded: false,
        contentType: null,
        animating: false,
      },
    },
    arguments: {
      showGradient: false,
      isPersistent: false,
      expandable: {
        isExpanded: false,
        contentType: null,
        animating: false,
      },
    },
    references: {
      showGradient: false,
      isPersistent: false,
      expandable: {
        isExpanded: false,
        contentType: null,
        animating: false,
      },
    },
    casestudies: {
      showGradient: false,
      isPersistent: false,
      expandable: {
        isExpanded: false,
        contentType: null,
        animating: false,
      },
    },
  };

  toggleGradient(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];

    // Map local card IDs to shared service task IDs
    const cardToTaskMap: Record<CardId, string> = {
      keywords: "keywords",
      assignment: "topic",
      arguments: "arguments",
      references: "review",
      casestudies: "cases",
    };

    const taskId = cardToTaskMap[typedCardId];

    // Check if interaction is allowed based on essay state
    const contentType = typedCardId;
    if (!this.essayStateService.isInteractionAllowed(contentType)) {
      console.warn(
        `Interaction with ${contentType} is not allowed in current essay phase`,
      );
      return;
    }

    // If the current card is already expanded, collapse it
    if (currentState.expandable.isExpanded) {
      this.dashboardService.collapseFeatureCard();
    } else {
      // Collapse all other cards first, then expand the clicked card
      this.dashboardService.expandFeatureCard(taskId);
    }
  }

  private expandCard(cardId: CardId): void {
    this.cardStates[cardId] = {
      ...this.cardStates[cardId],
      showGradient: true,
      isPersistent: true,
      expandable: {
        isExpanded: true,
        contentType: cardId,
        animating: true,
      },
    };
  }
  private collapseAllCards(): void {
    Object.keys(this.cardStates).forEach((cardId) => {
      this.cardStates[cardId as CardId] = {
        ...this.cardStates[cardId as CardId],
        showGradient: false,
        isPersistent: false,
        expandable: {
          isExpanded: false,
          contentType: null,
          animating: false,
        },
      };
    });
  }

  onKeywordSelected(keyword: KeywordData): void {
    console.log("Keyword selected:", keyword);
  }

  onKeywordDeselected(keyword: KeywordData): void {
    console.log("Keyword deselected:", keyword);
  }

  showGradientOnHover(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];

    // Only respond to hover if not expanded
    if (!currentState.expandable.isExpanded && !currentState.isPersistent) {
      this.cardStates[typedCardId] = {
        ...currentState,
        showGradient: true,
      };
    }
  }

  hideGradientOnHover(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];

    // Only respond to hover if not expanded
    if (!currentState.expandable.isExpanded && !currentState.isPersistent) {
      this.cardStates[typedCardId] = {
        ...currentState,
        showGradient: false,
      };
    }
  }

  getCardState(cardId: string): CardState {
    return this.cardStates[cardId as CardId];
  }

  trackByCardId(index: number, card: FeatureCard): string {
    return card.id;
  }
  private syncWithSharedState(sharedState: {
    isExpanded: boolean;
    contentType: string;
  }): void {
    if (sharedState.isExpanded && sharedState.contentType) {
      // Map shared service task IDs to local card IDs
      const taskToCardMap: Record<string, CardId> = {
        keywords: "keywords",
        topic: "assignment",
        arguments: "arguments",
        review: "references",
        cases: "casestudies",
        examples: "casestudies", // Fallback mapping
      };

      const cardId = taskToCardMap[sharedState.contentType];
      if (cardId) {
        // Collapse all cards first
        this.collapseAllCards();
        // Expand the corresponding card
        this.expandCard(cardId);
      }
    } else {
      // Collapse all cards if nothing is expanded
      this.collapseAllCards();
    }
  }
}
