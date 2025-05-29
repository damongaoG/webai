import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { IconComponent } from "@/app/shared";

export type MessageType = "success" | "error" | "warning" | "info" | "loading";

@Component({
  selector: "app-message",
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div [class]="messageClasses" [@slideIn]>
      <!-- Icon -->
      <div class="flex-shrink-0">
        <app-icon
          *ngIf="type !== 'loading'"
          [name]="iconName"
          [size]="16"
          [customClass]="iconClasses"
        ></app-icon>

        <!-- Loading spinner -->
        <div
          *ngIf="type === 'loading'"
          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        ></div>
      </div>

      <!-- Content -->
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium">{{ content }}</p>
      </div>

      <!-- Close button -->
      <div *ngIf="closable" class="ml-4 flex-shrink-0">
        <button
          type="button"
          class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
          (click)="close()"
        >
          <app-icon name="x" [size]="16"></app-icon>
        </button>
      </div>
    </div>
  `,
  styles: [],
  animations: [],
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() type: MessageType = "info";
  @Input() content = "";
  @Input() duration = 3000;
  @Input() closable = false;
  @Input() customClass = "";

  @Output() closed = new EventEmitter<void>();

  private timer?: number;

  ngOnInit(): void {
    if (this.duration > 0 && this.type !== "loading") {
      this.timer = window.setTimeout(() => {
        this.close();
      }, this.duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  get messageClasses(): string {
    const baseClasses = [
      "flex",
      "items-start",
      "p-4",
      "rounded-md",
      "shadow-sm",
      "border",
      "mb-2",
      "transition-all",
      "duration-300",
    ];

    const typeClasses = {
      success: ["bg-green-50", "border-green-200", "text-green-800"],
      error: ["bg-red-50", "border-red-200", "text-red-800"],
      warning: ["bg-yellow-50", "border-yellow-200", "text-yellow-800"],
      info: ["bg-blue-50", "border-blue-200", "text-blue-800"],
      loading: ["bg-gray-50", "border-gray-200", "text-gray-800"],
    };

    return [...baseClasses, ...typeClasses[this.type], this.customClass].join(
      " ",
    );
  }

  get iconName(): string {
    const iconMap = {
      success: "check-circle",
      error: "x-circle",
      warning: "alert-triangle",
      info: "info",
      loading: "",
    };
    return iconMap[this.type];
  }

  get iconClasses(): string {
    const typeClasses = {
      success: "text-green-500",
      error: "text-red-500",
      warning: "text-yellow-500",
      info: "text-blue-500",
      loading: "text-gray-500",
    };
    return typeClasses[this.type];
  }

  close(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.closed.emit();
  }
}
