import {
  Component,
  OnInit,
  HostListener,
  signal,
  computed,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { ButtonComponent, IconComponent } from "@/app/shared";
import { CenteredLayoutComponent } from "@/app/shared";
import { ToastService } from "@/app/shared";
import { ActivationCodeService } from "@/app/services/activation-code.service";
import { ActivationCodeVo } from "@/app/interfaces/activation-code-vo";
import { DisplayActivationCode } from "@/app/interfaces/display-activation-code";

@Component({
  selector: "app-activation-code",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    CenteredLayoutComponent,
  ],
  template: `
    <app-centered-layout>
      <div class="activation-code-container">
        <!-- Header with back navigation -->
        <div class="page-header">
          <app-button
            variant="ghost"
            size="small"
            (clicked)="navigateBack()"
            customClass="back-button"
          >
            <app-icon name="arrow-left" [size]="16"></app-icon>
            <span>Back to Chat</span>
          </app-button>
          <h1 class="page-title">Activation Codes</h1>
          <p class="page-description">View and manage your activation codes.</p>
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
          <select
            class="status-filter"
            [value]="selectedStatus()"
            (change)="onStatusFilterChange($event)"
          >
            <option [value]="null">All Status</option>
            <option [value]="0">Unused</option>
            <option [value]="1">Using</option>
            <option [value]="2">Used</option>
            <option [value]="-1">Expired</option>
          </select>
        </div>

        <!-- Desktop Table View -->
        <div class="table-container" *ngIf="!isMobile()">
          <div class="table-wrapper" [class.loading]="loading()">
            <table class="activation-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of displayData(); trackBy: trackByCode">
                  <td class="code-cell">{{ item.code }}</td>
                  <td>
                    <span
                      class="status-badge"
                      [class]="'status-' + getStatusClass(item.status)"
                    >
                      {{ getStatusName(item.status) }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="item.createTime; else noDate">
                      {{ formatDate(item.createTime) }}
                    </span>
                    <ng-template #noDate>-</ng-template>
                  </td>
                </tr>
                <tr
                  *ngIf="displayData().length === 0 && !loading()"
                  class="no-data-row"
                >
                  <td colspan="3" class="no-data-cell">
                    <app-icon name="inbox" [size]="24"></app-icon>
                    <span>No activation codes found</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Loading overlay -->
            <div *ngIf="loading()" class="loading-overlay">
              <div class="loading-spinner">
                <app-icon
                  name="loader"
                  [size]="24"
                  class="animate-spin"
                ></app-icon>
                <span>Loading...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Card View -->
        <div class="mobile-cards" *ngIf="isMobile()">
          <div
            class="mobile-card"
            *ngFor="let item of displayData(); trackBy: trackByCode"
          >
            <div class="card-row">
              <span class="card-label">Code:</span>
              <span class="card-value">{{ item.code }}</span>
            </div>
            <div class="card-row">
              <span class="card-label">Status:</span>
              <span
                class="status-badge"
                [class]="'status-' + getStatusClass(item.status)"
              >
                {{ getStatusName(item.status) }}
              </span>
            </div>
            <div class="card-row">
              <span class="card-label">Created:</span>
              <span class="card-value">
                <span *ngIf="item.createTime; else noDate">
                  {{ formatDate(item.createTime) }}
                </span>
                <ng-template #noDate>-</ng-template>
              </span>
            </div>
          </div>

          <div
            *ngIf="displayData().length === 0 && !loading()"
            class="no-data-mobile"
          >
            <app-icon name="inbox" [size]="32"></app-icon>
            <span>No activation codes found</span>
          </div>

          <!-- Mobile Loading -->
          <div *ngIf="loading()" class="mobile-loading">
            <app-icon name="loader" [size]="24" class="animate-spin"></app-icon>
            <span>Loading...</span>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-container" *ngIf="totalElements() > 0">
          <div class="pagination-info">
            <span>Total {{ totalElements() }} items</span>
          </div>
          <div class="pagination-controls">
            <app-button
              variant="ghost"
              size="small"
              [disabled]="currentPage() <= 1"
              (clicked)="onPageChange(currentPage() - 1)"
            >
              <app-icon name="chevron-left" [size]="16"></app-icon>
            </app-button>

            <span class="page-info">
              {{ currentPage() }} / {{ totalPages() }}
            </span>

            <app-button
              variant="ghost"
              size="small"
              [disabled]="currentPage() >= totalPages()"
              (clicked)="onPageChange(currentPage() + 1)"
            >
              <app-icon name="chevron-right" [size]="16"></app-icon>
            </app-button>
          </div>
        </div>
      </div>
    </app-centered-layout>
  `,
  styleUrls: ["./activation-code.component.scss"],
})
export class ActivationCodeComponent implements OnInit {
  // Signals for reactive state management
  private readonly activationCodes = signal<DisplayActivationCode[]>([]);
  private readonly _loading = signal(false);
  private readonly _isMobile = signal(false);
  private readonly _currentPage = signal(1);
  private readonly _totalElements = signal(0);
  private readonly _totalPages = signal(0);
  private readonly _selectedStatus = signal<number | null>(null);

  // Form for code verification
  activationForm!: FormGroup;

  // Page configuration
  private readonly pageSize = 10;

  // Computed properties
  readonly displayData = computed(() => this.activationCodes());
  readonly loading = computed(() => this._loading());
  readonly isMobile = computed(() => this._isMobile());
  readonly currentPage = computed(() => this._currentPage());
  readonly totalElements = computed(() => this._totalElements());
  readonly totalPages = computed(() => this._totalPages());
  readonly selectedStatus = computed(() => this._selectedStatus());

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activationCodeService: ActivationCodeService,
    private toastService: ToastService,
  ) {
    this.initializeForm();
    this.checkScreenSize();
  }

  @HostListener("window:resize")
  checkScreenSize(): void {
    this._isMobile.set(window.innerWidth <= 768);
  }

  ngOnInit(): void {
    this.loadActivationCodes();
  }

  private initializeForm(): void {
    this.activationForm = this.fb.group({
      activationCode: ["", [Validators.required, Validators.minLength(4)]],
    });
  }

  /**
   * Navigate back to the previous page
   */
  navigateBack(): void {
    this.router.navigate(["/rewrite"]);
  }

  /**
   * Load activation codes with current filters and pagination
   */
  private loadActivationCodes(pageIndex: number = this.currentPage()): void {
    this._loading.set(true);

    const params: any = {
      page: pageIndex - 1,
      pageSize: this.pageSize,
    };

    // Add status filter if selected
    if (this.selectedStatus() !== null) {
      params.dataFields = [
        {
          name: "status",
          value: this.selectedStatus()!.toString(),
          operator: "eq",
        },
      ];
    }

    this.activationCodeService.listActivationCodes(params).subscribe({
      next: (result) => {
        this._loading.set(false);
        if (result.code === 1 && result.data) {
          const mappedData = result.data.content.map(this.mapToDisplayCode);
          this.activationCodes.set(mappedData);
          this._totalElements.set(result.data.totalElements);
          this._totalPages.set(result.data.totalPages);
          this._currentPage.set(result.data.number + 1);
        } else {
          this.toastService.error("Failed to load activation codes");
        }
      },
      error: (error) => {
        this._loading.set(false);
        console.error("Error loading activation codes:", error);
        this.toastService.error("Failed to load activation codes");
      },
    });
  }

  /**
   * Map ActivationCodeVo to DisplayActivationCode
   */
  private mapToDisplayCode(code: ActivationCodeVo): DisplayActivationCode {
    return {
      id: code.id,
      code: code.code,
      status: code.status,
      createTime: code.createTime,
    };
  }

  /**
   * Handle page change
   */
  onPageChange(pageIndex: number): void {
    if (pageIndex >= 1 && pageIndex <= this.totalPages()) {
      this.loadActivationCodes(pageIndex);
    }
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value === "null" ? null : parseInt(target.value, 10);
    this._selectedStatus.set(value);
    this.loadActivationCodes(1); // Reset to first page when filtering
  }

  /**
   * Get status display name
   */
  getStatusName(status: number): string {
    switch (status) {
      case 0:
        return "Unused";
      case 1:
        return "Using";
      case 2:
        return "Used";
      case -1:
        return "Expired";
      default:
        return "Unknown";
    }
  }

  /**
   * Get status CSS class
   */
  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return "unused";
      case 1:
        return "using";
      case 2:
        return "used";
      case -1:
        return "expired";
      default:
        return "unknown";
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByCode(index: number, item: DisplayActivationCode): string {
    return item.id;
  }
}
