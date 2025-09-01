import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ArgumentData } from "@/app/interfaces/essay-create.interface";
import {
  UnifiedGridConfig,
  ArgumentsGridConfig,
} from "../../interfaces/grid.interface";
import { UnifiedGridComponent } from "../unified-grid/unified-grid.component";

@Component({
  selector: "app-arguments-grid",
  standalone: true,
  imports: [CommonModule, UnifiedGridComponent],
  template: `
    <app-unified-grid
      [items]="arguments"
      [gridConfig]="unifiedGridConfig"
      [isSelectable]="isSelectable"
      (itemSelected)="onArgumentSelected($event)"
      (itemDeselected)="onArgumentDeselected($event)"
    />
  `,
  styleUrl: "./arguments-grid.component.scss",
})
export class ArgumentsGridComponent {
  @Input() arguments: ArgumentData[] = [];
  @Input() gridConfig: ArgumentsGridConfig = {
    columns: 3,
    gap: 16,
    animationDuration: 300,
  };
  @Input() isSelectable: boolean = true;

  @Output() argumentSelected = new EventEmitter<ArgumentData>();
  @Output() argumentDeselected = new EventEmitter<ArgumentData>();

  /**
   * Convert legacy grid config to unified grid config
   */
  get unifiedGridConfig(): UnifiedGridConfig {
    return {
      columns: this.gridConfig.columns,
      gap: this.gridConfig.gap,
      animationDuration: this.gridConfig.animationDuration,
      showEmptyState: true,
      emptyStateMessage: "No available arguments",
      emptyStateSubMessage:
        "Arguments will appear here once they are generated",
    };
  }

  /**
   * Handle argument selection
   */
  onArgumentSelected(argument: ArgumentData): void {
    console.log("Argument selected:", argument);
    this.argumentSelected.emit(argument);
  }

  /**
   * Handle argument deselection
   */
  onArgumentDeselected(argument: ArgumentData): void {
    console.log("Argument deselected:", argument);
    this.argumentDeselected.emit(argument);
  }
}
