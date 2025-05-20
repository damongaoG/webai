import { Component } from "@angular/core";
import { DashboardSidebarComponent } from "./components/sidebar/sidebar.component";
import { DashboardHeaderComponent } from "./components/header/dashboard-header.component";
import { DashboardContentComponent } from "./components/content/dashboard-content.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    DashboardSidebarComponent,
    DashboardHeaderComponent,
    DashboardContentComponent,
  ],
  template: `
    <div class="dashboard-container h-screen flex overflow-hidden bg-black">
      <!-- Sidebar -->
      <app-dashboard-sidebar></app-dashboard-sidebar>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden main-content-area">
        <!-- Header -->
        <app-dashboard-header></app-dashboard-header>

        <!-- Content -->
        <div class="flex-1 overflow-auto">
          <app-dashboard-content></app-dashboard-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        background-color: #0c0c0c;
      }

      .main-content-area {
        background-image: url("/assets/images/bg.png");
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
    `,
  ],
})
export class DashboardComponent {}
