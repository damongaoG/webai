import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardSharedService, TaskItem } from "../dashboard-shared.service";
import { TaskSelectionService } from "@/app/services/task-selection.service";
import { EssayStateService } from "@/app/services/essay-state.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
})
export class SidebarComponent implements OnInit, OnDestroy {
  dashboardService = inject(DashboardSharedService);
  private taskSelectionService = inject(TaskSelectionService);
  private essayStateService = inject(EssayStateService);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribe to task selection events
    this.taskSelectionService.taskSelection$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event) {
          // Select the task by type when an expand event occurs
          if (event.isExpanded) {
            this.dashboardService.selectTaskByType(event.taskType);
          } else {
            this.dashboardService.clearTaskSelection();
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTask(taskId: string) {
    // Check if interaction is allowed based on essay state
    if (!this.isTaskInteractionAllowed(taskId)) {
      return;
    }
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

  /**
   * Check if task interaction is allowed based on current essay state
   */
  isTaskInteractionAllowed(taskId: string): boolean {
    return this.essayStateService.isInteractionAllowed(taskId);
  }

  /**
   * Check if task should be disabled (for styling purposes)
   */
  isTaskDisabled(taskId: string): boolean {
    return !this.isTaskInteractionAllowed(taskId);
  }
}
