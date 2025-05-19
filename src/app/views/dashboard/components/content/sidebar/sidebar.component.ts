import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardSharedService } from "../dashboard-shared.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="sidebar h-full rounded-lg border border-gray-700 bg-[#1A1A1A] p-4 overflow-y-auto"
    >
      <div class="task-list space-y-2">
        @for (task of dashboardService.getTaskItems()(); track task.id) {
          <div
            [class]="
              'task-item flex items-center p-3 rounded-lg cursor-pointer transition-colors ' +
              (task.isSelected ? 'bg-green-500/20' : 'hover:bg-gray-800')
            "
            (click)="selectTask(task.id)"
          >
            <div class="icon-container mr-3">
              <img
                [src]="getIconPath(task.id)"
                class="w-5"
                alt="task icon"
              />
            </div>

            <span
              class="task-name"
              [ngStyle]="{ color: task.isSelected ? '#05A76F' : '#555' }"
              >{{ task.name }}</span
            >
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

      .task-name {
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
      }

      .icon-container {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;

        fill: rgba(255, 255, 255, 0.40);
        stroke-width: 0.5px;
        stroke: #FFF;
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05));
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

  getIconPath(taskId: string): string {
    const iconMap: { [key: string]: string } = {
      keywords: "/assets/images/icon/light-keyword.svg",
      topic: "/assets/images/icon/light-task.svg",
      arguments: "/assets/images/icon/light-argument-point.svg",
      review: "/assets/images/icon/light-review.svg",
      cases: "/assets/images/icon/light-case.svg",
      examples: "/assets/images/icon/light-essay.svg",
    };

    return iconMap[taskId] || "";
  }
}
