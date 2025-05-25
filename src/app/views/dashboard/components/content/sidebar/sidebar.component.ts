import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardSharedService, TaskItem } from "../dashboard-shared.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
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

    const iconMap: Record<string, string> = {
      keywords: `/assets/images/icon/${prefix}-keyword.svg`,
      topic: `/assets/images/icon/${prefix}-task.svg`,
      arguments: `/assets/images/icon/${prefix}-argument-point.svg`,
      review: `/assets/images/icon/${prefix}-review.svg`,
      cases: `/assets/images/icon/${prefix}-case.svg`,
      examples: `/assets/images/icon/${prefix}-essay.svg`,
    };

    return iconMap[task.id] || "";
  }

  trackByTaskId(index: number, task: TaskItem): string {
    return task.id;
  }
}
