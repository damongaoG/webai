import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "default"
  | "danger"
  | "ghost";
export type ButtonSize = "small" | "medium" | "large";
export type ButtonShape = "default" | "circle" | "round";

@Component({
  selector: "app-button",
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [type]="type"
      (click)="handleClick($event)"
    >
      <!-- Loading spinner -->
      <div
        *ngIf="loading"
        class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      ></div>

      <!-- Button content -->
      <ng-content></ng-content>
    </button>
  `,
  styles: [],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = "default";
  @Input() size: ButtonSize = "medium";
  @Input() shape: ButtonShape = "default";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() block = false;
  @Input() customClass = "";

  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    const baseClasses = [
      "inline-flex",
      "items-center",
      "justify-center",
      "font-medium",
      "transition-all",
      "duration-200",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-offset-2",
      "disabled:opacity-50",
      "disabled:cursor-not-allowed",
    ];

    // Size classes
    const sizeClasses = {
      small: ["px-3", "py-1.5", "text-sm"],
      medium: ["px-4", "py-2", "text-sm"],
      large: ["px-6", "py-3", "text-base"],
    };

    // Shape classes
    const shapeClasses = {
      default: ["rounded-md"],
      circle: ["rounded-full", "aspect-square"],
      round: ["rounded-full"],
    };

    // Variant classes
    const variantClasses = {
      primary: [
        "bg-blue-600",
        "text-white",
        "hover:bg-blue-700",
        "focus:ring-blue-500",
        "border",
        "border-transparent",
      ],
      secondary: [
        "bg-gray-600",
        "text-white",
        "hover:bg-gray-700",
        "focus:ring-gray-500",
        "border",
        "border-transparent",
      ],
      default: [
        "bg-white",
        "text-gray-700",
        "hover:bg-gray-50",
        "focus:ring-gray-500",
        "border",
        "border-gray-300",
      ],
      danger: [
        "bg-red-600",
        "text-white",
        "hover:bg-red-700",
        "focus:ring-red-500",
        "border",
        "border-transparent",
      ],
      ghost: [
        "bg-transparent",
        "text-gray-700",
        "hover:bg-gray-100",
        "focus:ring-gray-500",
        "border",
        "border-transparent",
      ],
    };

    // Block classes
    const blockClasses = this.block ? ["w-full"] : [];

    // Circle size adjustments
    const circleAdjustments =
      this.shape === "circle"
        ? {
            small: ["w-8", "h-8", "p-0"],
            medium: ["w-10", "h-10", "p-0"],
            large: ["w-12", "h-12", "p-0"],
          }
        : { small: [], medium: [], large: [] };

    return [
      ...baseClasses,
      ...(this.shape === "circle"
        ? circleAdjustments[this.size]
        : sizeClasses[this.size]),
      ...shapeClasses[this.shape],
      ...variantClasses[this.variant],
      ...blockClasses,
      this.customClass,
    ].join(" ");
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
