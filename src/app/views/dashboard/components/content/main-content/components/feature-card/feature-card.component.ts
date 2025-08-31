import { Component, Input, Output, EventEmitter, inject } from "@angular/core";
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

  private taskSelectionService = inject(TaskSelectionService);
  private readonly essayStateService = inject(EssayStateService);

  sampleKeywords: KeywordData[] = [
    { id: "1", text: "keywords01", isSelected: true },
    { id: "2", text: "keywords02", isSelected: false },
    { id: "3", text: "keywords03", isSelected: false },
    { id: "4", text: "keywords04", isSelected: false },
    { id: "5", text: "keywords05", isSelected: false },
    { id: "6", text: "keywords06", isSelected: false },
    { id: "7", text: "keywords07", isSelected: false },
    { id: "8", text: "keywords08", isSelected: false },
    { id: "9", text: "keywords09", isSelected: false },
    { id: "10", text: "keywords10", isSelected: false },
    { id: "11", text: "keywords11", isSelected: false },
    { id: "12", text: "keywords12", isSelected: false },
  ];

  onExpandClick(): void {
    // Check if this card interaction is allowed
    if (!this.isInteractionAllowed) {
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
    }
  }

  onExpandHoverStart(): void {
    this.expandHoverStart.emit(this.featureCard.id);
  }

  onExpandHoverEnd(): void {
    this.expandHoverEnd.emit(this.featureCard.id);
  }

  onKeywordSelected(keyword: KeywordData): void {
    this.keywordSelected.emit(keyword);
  }

  onKeywordDeselected(keyword: KeywordData): void {
    this.keywordDeselected.emit(keyword);
  }

  get shouldShowExpandableContent(): boolean {
    return (
      this.cardState.expandable.isExpanded &&
      this.cardState.expandable.contentType === this.featureCard.id
    );
  }

  get keywordsData(): KeywordData[] {
    if (this.featureCard.id === "keywords") {
      return this.sampleKeywords;
    }
    return [];
  }

  get isInteractionAllowed(): boolean {
    return this.essayStateService.isInteractionAllowed(this.featureCard.id);
  }
}
