import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="sidebar h-full rounded-lg border border-gray-700 bg-[#1A1A1A] p-4 overflow-y-auto"
    >
      <div class="mb-6">
        <h2 class="text-white text-lg font-medium mb-2">Tasks</h2>
        <p class="text-white/50 text-sm">Select a task to generate essay</p>
      </div>

      <div class="task-list space-y-2">
        @for (task of dashboardService.getTaskItems()(); track task.id) {
          <div
            [class]="
              'task-item flex items-center p-3 rounded-lg cursor-pointer transition-colors ' +
              (task.isSelected
                ? 'bg-green-500/20 text-green-500'
                : 'text-white/70 hover:bg-gray-800')
            "
            (click)="selectTask(task.id)"
          >
            <lucide-angular
              [name]="task.isSelected ? 'check-circle' : 'circle'"
              class="h-5 w-5 mr-3"
            >
            </lucide-angular>
            <span>{{ task.name }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .sidebar {
        min-width: 250px;
        background-color: #fff;
        stroke-width: 2px;
        stroke: rgba(255, 255, 255, 0.23);
        filter: drop-shadow(2px 0px 4px rgba(0, 0, 0, 0.05));
        backdrop-filter: blur(5px);
      }
    `,
  ],
})
export class SidebarComponent {
  dashboardService = inject(DashboardSharedService);

  selectTask(taskId: string) {
    this.dashboardService.selectTask(taskId);
  }
}
