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
      class="content-container h-full flex flex-row"
      style="background: #F3F6F8;"
    >
      <!-- Left Sidebar -->
      <app-sidebar class="w-1/6 mr-4"></app-sidebar>

      <!-- Main Content Area -->
      <app-main-content class="w-3/6 mx-4"></app-main-content>

      <!-- Right Sample Essay Area -->
      <app-sample-essay class="w-2/6 ml-4"></app-sample-essay>
    </div>
  `,
  styles: [
    `
      .content-container {
        overflow-y: auto;
      }
    `,
  ],
})
export class DashboardContentComponent {}
