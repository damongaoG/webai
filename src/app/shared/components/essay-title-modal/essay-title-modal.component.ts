import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-essay-title-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Modal Backdrop -->
    @if (visible()) {
      <div
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Content -->
        <div
          class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div
            class="flex items-center justify-between p-6 border-b border-gray-700"
          >
            <h3 class="text-lg font-semibold text-white">Create New Essay</h3>
            <button
              type="button"
              class="text-gray-400 hover:text-white transition-colors"
              (click)="onCancel()"
            >
              <lucide-angular name="x" class="h-5 w-5"></lucide-angular>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6">
            <div class="mb-4">
              <label
                for="essayTitle"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Essay Title
              </label>
              <input
                #titleInput
                id="essayTitle"
                type="text"
                [(ngModel)]="titleValue"
                [class]="getInputClasses()"
                placeholder="Enter your essay title..."
                (keyup.enter)="onConfirm()"
                (keyup.escape)="onCancel()"
                maxlength="200"
              />
              @if (showError()) {
                <p class="mt-2 text-sm text-red-400">
                  {{ errorMessage() }}
                </p>
              }
            </div>

            <!-- Character count -->
            <div class="text-right text-xs text-gray-400">
              {{ titleValue.length }}/200
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors"
              (click)="onCancel()"
            >
              Cancel
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="!isValidTitle()"
              (click)="onConfirm()"
            >
              Create Essay
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-input {
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.5rem;
        background-color: #374151;
        border: 1px solid #4b5563;
        color: white;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .modal-input:focus {
        outline: none;
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }

      .modal-input.error {
        border-color: #ef4444;
      }

      .modal-input.error:focus {
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }
    `,
  ],
})
export class EssayTitleModalComponent implements AfterViewInit {
  @Input() visible = signal(false);
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() titleConfirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  titleValue = "";
  showError = signal(false);
  errorMessage = signal("");

  getInputClasses(): string {
    const baseClasses = "modal-input";
    return this.showError() ? `${baseClasses} error` : baseClasses;
  }

  isValidTitle(): boolean {
    return (
      this.titleValue.trim().length >= 2 && this.titleValue.trim().length <= 200
    );
  }

  onBackdropClick(event: Event): void {
    event.stopPropagation();
    this.onCancel();
  }

  onConfirm(): void {
    const trimmedTitle = this.titleValue.trim();

    if (!trimmedTitle) {
      this.showError.set(true);
      this.errorMessage.set("Please enter an essay title");
      return;
    }

    if (trimmedTitle.length < 2) {
      this.showError.set(true);
      this.errorMessage.set("Title must be at least 2 characters long");
      return;
    }

    if (trimmedTitle.length > 200) {
      this.showError.set(true);
      this.errorMessage.set("Title must be less than 200 characters");
      return;
    }

    // Clear any previous errors
    this.showError.set(false);
    this.errorMessage.set("");

    // Emit the confirmed title
    this.titleConfirmed.emit(trimmedTitle);

    // Close modal and reset
    this.closeModal();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.closeModal();
  }

  private closeModal(): void {
    this.visible.set(false);
    this.visibleChange.emit(false);
    this.titleValue = "";
    this.showError.set(false);
    this.errorMessage.set("");
  }

  ngAfterViewInit(): void {
    // Auto-focus input when modal opens
    if (this.visible()) {
      setTimeout(() => {
        const input = document.getElementById("essayTitle") as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }
}
