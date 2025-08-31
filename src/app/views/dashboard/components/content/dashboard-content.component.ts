import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { MainContentComponent } from "./main-content/main-content.component";
import { SampleEssayComponent } from "./sample-essay/sample-essay.component";
import { DashboardSharedService } from "./dashboard-shared.service";

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    SidebarComponent,
    MainContentComponent,
    SampleEssayComponent,
  ],
  providers: [DashboardSharedService],
  template: `
    <div
      class="content-container h-full flex flex-col lg:flex-row gap-4"
      style="background: #F3F6F8;"
    >
      <!-- Left Sidebar - Hidden on mobile, shown on large screens -->
      <app-sidebar class="hidden lg:block lg:w-1/6 lg:min-w-48"></app-sidebar>

      <!-- Main Content Area - Full width on mobile, adjusted on larger screens -->
      <app-main-content
        class="flex-1 lg:w-3/6 order-1 lg:order-none"
      ></app-main-content>

      <!-- Right Sample Essay Area - Full width on mobile, smaller on larger screens -->
      <app-sample-essay
        class="w-full lg:w-2/6 lg:min-w-80 order-2 lg:order-none"
      ></app-sample-essay>
    </div>
  `,
  styles: [
    `
      .content-container {
        overflow-y: auto;
        min-height: 0; /* Allow flexbox to shrink */
      }

      /* Mobile-first responsive styles */
      @media (max-width: 1024px) {
        .content-container {
          flex-direction: column;
          gap: 1rem;
        }
      }

      /* Tablet adjustments */
      @media (min-width: 768px) and (max-width: 1024px) {
        .content-container {
          gap: 1.5rem;
        }
      }

      /* Desktop optimizations */
      @media (min-width: 1025px) {
        .content-container {
          gap: 1.5rem;
        }
      }
    `,
  ],
})
export class DashboardContentComponent {}
