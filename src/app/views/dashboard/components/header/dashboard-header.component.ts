import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "@/app/services/auth.service";

@Component({
  selector: "app-dashboard-header",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="header-container flex items-center justify-between p-4 border-b"
    >
      <!-- Title -->
      <div class="title">Essay02</div>

      <!-- Right Side Controls -->
      <div class="flex items-center space-x-4">
        <!-- Settings Icon -->
        <button class="text-white/70 hover:text-white">
          <img src="/assets/images/icon/system-setting.svg" alt="" />
        </button>

        <!-- User Email -->
        <div *ngIf="userEmail" class="text-sm font-medium">
          {{ userEmail }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .title {
        color: #000;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
      }

      .header-container {
        background-color: #fff;

        fill: rgba(255, 255, 255, 0.4);
        stroke-width: 2px;
        stroke: #fff;
        filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
        backdrop-filter: blur(5px);
      }
    `,
  ],
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  userEmail = "";
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to user email changes from AuthService
    this.authService
      .getUserEmail()
      .pipe(takeUntil(this.destroy$))
      .subscribe((email) => {
        this.userEmail = email;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
