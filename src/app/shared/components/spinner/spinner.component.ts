import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type SpinnerSize = "small" | "medium" | "large";

@Component({
  selector: "app-spinner",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      <div [class]="spinnerClasses"></div>
      <span *ngIf="text" [class]="textClasses">{{ text }}</span>
    </div>
  `,
  styles: [],
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = "medium";
  @Input() text = "";
  @Input() simple = false;
  @Input() customClass = "";

  get containerClasses(): string {
    const baseClasses = ["flex", "items-center"];

    if (this.simple) {
      return [...baseClasses, this.customClass].join(" ");
    }

    return [
      ...baseClasses,
      "justify-center",
      "flex-col",
      "space-y-2",
      this.customClass,
    ].join(" ");
  }

  get spinnerClasses(): string {
    const baseClasses = [
      "animate-spin",
      "rounded-full",
      "border-2",
      "border-current",
      "border-t-transparent",
    ];

    const sizeClasses = {
      small: ["w-4", "h-4"],
      medium: ["w-6", "h-6"],
      large: ["w-8", "h-8"],
    };

    return [...baseClasses, ...sizeClasses[this.size]].join(" ");
  }

  get textClasses(): string {
    const baseClasses = ["text-gray-600"];

    const textSizeClasses = {
      small: ["text-xs"],
      medium: ["text-sm"],
      large: ["text-base"],
    };

    return [
      ...baseClasses,
      ...textSizeClasses[this.size],
      this.simple ? "ml-2" : "",
    ].join(" ");
  }
}
