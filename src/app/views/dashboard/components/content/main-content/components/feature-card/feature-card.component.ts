import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FeatureCard,
  CardState,
} from "../../interfaces/feature-card.interface";

@Component({
  selector: "app-feature-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./feature-card.component.html",
  styleUrl: "./feature-card.component.scss",
})
export class FeatureCardComponent {
  @Input() featureCard!: FeatureCard;

  @Input() cardState!: CardState;

  @Output() expandClicked = new EventEmitter<string>();

  @Output() expandHoverStart = new EventEmitter<string>();

  @Output() expandHoverEnd = new EventEmitter<string>();

  onExpandClick(): void {
    this.expandClicked.emit(this.featureCard.id);
  }

  onExpandHoverStart(): void {
    this.expandHoverStart.emit(this.featureCard.id);
  }

  onExpandHoverEnd(): void {
    this.expandHoverEnd.emit(this.featureCard.id);
  }
}
