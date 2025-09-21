import { Component, input, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModalComponent } from "@/app/shared";

@Component({
  selector: "app-wordcount-input-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [visible]="visible()"
      [title]="'Generate Essay'"
      [showFooter]="false"
      [showCloseButton]="true"
      [customClass]="'max-w-md'"
      (cancel)="handleCancel()"
      (visibleChange)="onVisibleChange($event)"
    >
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label
            for="wordcount"
            class="block text-sm font-medium text-gray-700"
          >
            Desired word count
          </label>
          <input
            id="wordcount"
            name="wordcount"
            type="number"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            [(ngModel)]="wordcount"
            [min]="min"
            [max]="max"
            required
            aria-describedby="wordcount-help"
          />
          <p id="wordcount-help" class="mt-1 text-xs text-gray-500">
            Enter a value between {{ min }} and {{ max }}.
          </p>
          <p *ngIf="showError()" class="mt-1 text-xs text-red-600">
            {{ errorMessage() }}
          </p>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            (click)="handleCancel()"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class WordcountInputModalComponent {
  visible = input.required<boolean>();
  visibleChange = output<boolean>();
  confirmed = output<number>();

  min = 1000;
  max = 8000;
  wordcount = 2000;

  showError = signal(false);
  errorMessage = signal("");

  private clamp(value: number): number {
    if (!Number.isFinite(value)) return this.min;
    return Math.max(this.min, Math.min(this.max, Math.trunc(value)));
  }

  onVisibleChange(v: boolean): void {
    this.visibleChange.emit(v);
  }

  handleCancel(): void {
    this.visibleChange.emit(false);
    this.reset();
  }

  onSubmit(): void {
    const clamped = this.clamp(Number(this.wordcount));
    if (clamped < this.min || clamped > this.max) {
      this.showError.set(true);
      this.errorMessage.set(
        `Please enter a value between ${this.min} and ${this.max}.`,
      );
      return;
    }
    this.showError.set(false);
    this.errorMessage.set("");
    this.confirmed.emit(clamped);
    this.visibleChange.emit(false);
    this.reset();
  }

  private reset(): void {
    this.wordcount = 2000;
    this.showError.set(false);
    this.errorMessage.set("");
  }
}
