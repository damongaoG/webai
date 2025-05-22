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
      class="h-20 bg-white/40 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-[5px] flex items-center justify-between p-4 border-b header-container"
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
        font-family: "Source Han Sans CN", sans-serif;
      }

      .header-container {
        background-color: #fff;
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
