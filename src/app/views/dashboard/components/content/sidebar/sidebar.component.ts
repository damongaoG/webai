import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardSharedService, TaskItem } from "../dashboard-shared.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar h-full rounded-lg border bg-[#1A1A1A] overflow-y-auto">
      <div class="task-list space-y-2">
        @for (task of dashboardService.getTaskItems()(); track task.id) {
          <div
            [class]="
              'task-item flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ' +
              (task.isSelected || task.isHovered
                ? 'bg-[rgba(5,167,111,0.10)]'
                : '')
            "
            (click)="selectTask(task.id)"
            (mouseenter)="setHoverState(task.id, true)"
            (mouseleave)="setHoverState(task.id, false)"
          >
            <div class="flex items-center">
              <div
                class="icon-container mr-3"
                [ngStyle]="{
                  'background-color':
                    task.isSelected || task.isHovered ? '#05a76f' : '',
                }"
              >
                <img [src]="getIconPath(task)" class="w-5" alt="task icon" />
              </div>

              <span
                class="task-name"
                [ngStyle]="{ color: task.isSelected ? '#05A76F' : '#555' }"
                >{{ task.name }}</span
              >
            </div>

            <img
              *ngIf="task.isSelected || task.isHovered"
              src="/assets/images/icon/dark-arrow.svg"
              class="w-5 h-4"
              alt="arrow icon"
            />
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

        fill: rgba(255, 255, 255, 0.4);
        stroke-width: 0.5px;
        stroke: #fff;
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

  setHoverState(taskId: string, isHovered: boolean) {
    // Update the hover state for the task
    const tasks = this.dashboardService.getTaskItems()();
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, isHovered };
      }
      return task;
    });

    // Update the tasks in the service
    this.dashboardService.updateTaskItems(updatedTasks);
  }

  getIconPath(task: TaskItem): string {
    const isActive = task.isSelected || task.isHovered;
    const prefix = isActive ? "dark" : "light";

    const iconMap: { [key: string]: string } = {
      keywords: `/assets/images/icon/${prefix}-keyword.svg`,
      topic: `/assets/images/icon/${prefix}-task.svg`,
      arguments: `/assets/images/icon/${prefix}-argument-point.svg`,
      review: `/assets/images/icon/${prefix}-review.svg`,
      cases: `/assets/images/icon/${prefix}-case.svg`,
      examples: `/assets/images/icon/${prefix}-essay.svg`,
    };

    return iconMap[task.id] || "";
  }
}
