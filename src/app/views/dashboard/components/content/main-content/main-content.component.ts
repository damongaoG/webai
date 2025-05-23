import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";
import { FeatureCardComponent } from "./components/feature-card/feature-card.component";
import {
  CardId,
  CardState,
  FeatureCard,
} from "./interfaces/feature-card.interface";

@Component({
  selector: "app-main-content",
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FeatureCardComponent],
  templateUrl: "./main-content.component.html",
  styleUrl: "./main-content.component.scss",
})
export class MainContentComponent {
  dashboardService = inject(DashboardSharedService);

  // Configuration for all feature cards
  featureCards: FeatureCard[] = [
    {
      id: "keywords",
      title: "Keywords",
      iconPath: "/assets/images/icon/dark-keyword.svg",
      iconAlt: "Keywords icon",
    },
    {
      id: "assignment",
      title: "Assignment task",
      iconPath: "/assets/images/icon/dark-task.svg",
      iconAlt: "Assignment task icon",
    },
    {
      id: "arguments",
      title: "Use arguments",
      iconPath: "/assets/images/icon/dark-argument-point.svg",
      iconAlt: "Use arguments icon",
    },
    {
      id: "references",
      title: "References",
      iconPath: "/assets/images/icon/dark-review.svg",
      iconAlt: "References icon",
    },
    {
      id: "casestudies",
      title: "Relevant case studies",
      iconPath: "/assets/images/icon/dark-case.svg",
      iconAlt: "Case studies icon",
    },
  ];

  // State management for each card's gradient visibility
  cardStates: Record<CardId, CardState> = {
    keywords: { showGradient: false, isPersistent: false },
    assignment: { showGradient: false, isPersistent: false },
    arguments: { showGradient: false, isPersistent: false },
    references: { showGradient: false, isPersistent: false },
    casestudies: { showGradient: false, isPersistent: false },
  };

  toggleGradient(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];
    const newPersistentState = !currentState.isPersistent;

    this.cardStates[typedCardId] = {
      showGradient: newPersistentState,
      isPersistent: newPersistentState,
    };
  }

  showGradientOnHover(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];

    // Only respond to hover
    if (!currentState.isPersistent) {
      this.cardStates[typedCardId] = {
        ...currentState,
        showGradient: true,
      };
    }
  }

  hideGradientOnHover(cardId: string): void {
    const typedCardId = cardId as CardId;
    const currentState = this.cardStates[typedCardId];

    // Only respond to hover
    if (!currentState.isPersistent) {
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

  generateEssay() {
    this.dashboardService.generateContent();
  }
}
