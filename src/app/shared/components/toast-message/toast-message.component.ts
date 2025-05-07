import { Component, Input, OnDestroy, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

@Component({
  selector: "app-toast-message",
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div
        class="fixed top-4 right-4 z-50 max-w-md shadow-lg rounded-lg px-6 py-4 overflow-hidden transition-all duration-300"
        [ngClass]="getToastClass()"
      >
        <div class="flex items-center">
          <span class="mr-2" [ngClass]="getIconClass()">
            @if (type === "success") {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            } @else if (type === "error") {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            } @else if (type === "info") {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            } @else if (type === "warning") {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            }
          </span>
          <p class="text-sm font-medium">{{ message }}</p>
        </div>
      </div>
    }
  `,
  styles: [],
})
export class ToastMessageComponent implements OnInit, OnDestroy {
  @Input() message: string = "";
  @Input() type: ToastType = "info";
  @Input() duration: number = 3000;

  visible = signal(false);
  private timeout: any;

  ngOnInit(): void {
    this.show();
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  show(): void {
    this.visible.set(true);
    if (this.duration > 0) {
      this.setTimeout();
    }
  }

  hide(): void {
    this.visible.set(false);
    this.clearTimeout();
  }

  private setTimeout(): void {
    this.clearTimeout();
    this.timeout = setTimeout(() => {
      this.hide();
    }, this.duration);
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  getToastClass(): string {
    const baseClasses = "flex items-center";

    switch (this.type) {
      case "success":
        return `${baseClasses} bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200 backdrop-blur-xl`;
      case "error":
        return `${baseClasses} bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200 backdrop-blur-xl`;
      case "warning":
        return `${baseClasses} bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 backdrop-blur-xl`;
      case "info":
      default:
        return `${baseClasses} bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 backdrop-blur-xl`;
    }
  }

  getIconClass(): string {
    switch (this.type) {
      case "success":
        return "text-green-500 dark:text-green-400";
      case "error":
        return "text-red-500 dark:text-red-400";
      case "warning":
        return "text-yellow-500 dark:text-yellow-400";
      case "info":
      default:
        return "text-blue-500 dark:text-blue-400";
    }
  }
}
