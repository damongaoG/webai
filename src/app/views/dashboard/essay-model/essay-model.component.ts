import { Component } from "@angular/core";
import { DashboardSidebarComponent } from "../components/sidebar/sidebar.component";
import { DashboardHeaderComponent } from "../components/header/dashboard-header.component";
import { DashboardContentComponent } from "../components/content/dashboard-content.component";

@Component({
  selector: "app-essay-model",
  standalone: true,
  imports: [
    DashboardSidebarComponent,
    DashboardHeaderComponent,
    DashboardContentComponent,
  ],
  templateUrl: "./essay-model.component.html",
  styleUrls: ["./essay-model.component.scss"],
})
export class EssayModelComponent {}
