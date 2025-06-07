import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@/app/shared";

@Component({
  selector: "app-modal",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <!-- Modal backdrop -->
    <div
      *ngIf="visible"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="handleBackdropClick($event)"
    >
      <!-- Backdrop overlay -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <!-- Modal container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <!-- Modal content -->
        <div [class]="modalClasses" (click)="$event.stopPropagation()">
          <!-- Modal header -->
          <div
            *ngIf="title || showCloseButton"
            class="flex items-center justify-between border-b border-gray-200 px-6 py-4"
          >
            <h3 *ngIf="title" class="text-lg font-semibold text-gray-900">
              {{ title }}
            </h3>
            <!-- Close button with CSS-only X symbol - no external icon dependencies -->
            <button
              *ngIf="showCloseButton"
              type="button"
              class="modal-close-btn"
              (click)="handleCancel()"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <!-- Modal body -->
          <div class="px-6 py-4">
            <ng-content></ng-content>
          </div>

          <!-- Modal footer -->
          <div
            *ngIf="showFooter"
            class="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4"
          >
            <app-button
              *ngIf="showCancelButton"
              variant="default"
              (clicked)="handleCancel()"
              [disabled]="confirmLoading"
            >
              {{ cancelText }}
            </app-button>
            <app-button
              *ngIf="showOkButton"
              variant="primary"
              (clicked)="handleOk()"
              [loading]="confirmLoading"
            >
              {{ okText }}
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: transparent;
        color: #6b7280;
        font-size: 20px;
        font-weight: 300;
        line-height: 1;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .modal-close-btn:hover {
        background-color: #f3f4f6;
        color: #374151;
      }

      .modal-close-btn:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }

      .modal-close-btn:active {
        background-color: #e5e7eb;
      }
    `,
  ],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() title = "";
  @Input() width = "520px";
  @Input() centered = false;
  @Input() closable = true;
  @Input() maskClosable = true;
  @Input() confirmLoading = false;
  @Input() showFooter = true;
  @Input() showOkButton = true;
  @Input() showCancelButton = true;
  @Input() showCloseButton = true;
  @Input() okText = "OK";
  @Input() cancelText = "Cancel";
  @Input() customClass = "";

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.visible) {
      this.addBodyClass();
    }
  }

  ngOnDestroy(): void {
    this.removeBodyClass();
  }

  get modalClasses(): string {
    const baseClasses = [
      "relative",
      "bg-white",
      "rounded-lg",
      "shadow-xl",
      "transform",
      "transition-all",
      "max-w-lg",
      "w-full",
      "mx-auto",
    ];

    return [...baseClasses, this.customClass].join(" ");
  }

  handleOk(): void {
    this.ok.emit();
  }

  handleCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.removeBodyClass();
  }

  handleBackdropClick(event: Event): void {
    if (this.maskClosable && event.target === event.currentTarget) {
      this.handleCancel();
    }
  }

  private addBodyClass(): void {
    document.body.classList.add("overflow-hidden");
  }

  private removeBodyClass(): void {
    document.body.classList.remove("overflow-hidden");
  }
}
