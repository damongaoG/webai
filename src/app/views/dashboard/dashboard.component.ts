import { Component } from "@angular/core";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
    `,
  ],
})
export class DashboardComponent {}
