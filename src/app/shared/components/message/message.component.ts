import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

export type MessageType = "success" | "error" | "warning" | "info" | "loading";

@Component({
  selector: "app-message",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="messageClasses" [@slideIn]>
      <!-- Icon with CSS-only symbols - no external icon dependencies -->
      <div class="flex-shrink-0">
        <div *ngIf="type !== 'loading'" [class]="'message-icon ' + iconClasses">
          {{ getIconSymbol() }}
        </div>

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

      <!-- Close button with CSS-only X symbol - no external icon dependencies -->
      <div *ngIf="closable" class="ml-4 flex-shrink-0">
        <button
          type="button"
          class="message-close-btn"
          (click)="close()"
          aria-label="Close message"
        >
          ×
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .message-close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 0.375rem;
        background: transparent;
        color: #9ca3af;
        font-size: 16px;
        font-weight: 300;
        line-height: 1;
        cursor: pointer;
        transition: color 0.2s ease;
      }

      .message-close-btn:hover {
        color: #6b7280;
      }

      .message-close-btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `,
  ],
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

  getIconSymbol(): string {
    const symbolMap = {
      success: "✓",
      error: "×",
      warning: "⚠",
      info: "i",
      loading: "",
    };
    return symbolMap[this.type];
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
