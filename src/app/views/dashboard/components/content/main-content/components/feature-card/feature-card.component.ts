import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FeatureCard,
  CardState,
} from "../../interfaces/feature-card.interface";
import { ExpandableContentComponent } from "../expandable-content/expandable-content.component";
import { KeywordData } from "../../interfaces/keyword.interface";

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

  @Output() expandClicked = new EventEmitter<string>();

  @Output() expandHoverStart = new EventEmitter<string>();

  @Output() expandHoverEnd = new EventEmitter<string>();
  @Output() keywordSelected = new EventEmitter<KeywordData>();
  @Output() keywordDeselected = new EventEmitter<KeywordData>();

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
    this.expandClicked.emit(this.featureCard.id);
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
}
