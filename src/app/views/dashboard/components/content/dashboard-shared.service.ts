import { TaskType } from "@/app/interfaces/task.interface";
import { Injectable, signal } from "@angular/core";

export interface TaskItem {
  id: string;
  name: string;
  type: TaskType;
  isSelected: boolean;
  isHovered?: boolean;
}

export interface ExpandableState {
  isExpanded: boolean;
  contentType: string;
}

export interface EssayContent {
  title: string;
  content: string;
}

@Injectable()
export class DashboardSharedService {
  // Available task items
  private taskItems = signal<TaskItem[]>([
    {
      id: "keywords",
      name: "Keywords",
      type: TaskType.KEYWORD,
      isSelected: false,
    },
    {
      id: "topic",
      name: "Assignment task",
      type: TaskType.CONTENT,
      isSelected: false,
    },
    {
      id: "arguments",
      name: "Use arguments",
      type: TaskType.STYLE,
      isSelected: false,
    },
    {
      id: "review",
      name: "References",
      type: TaskType.GRAMMAR,
      isSelected: false,
    },
    {
      id: "cases",
      name: "Relevant case studies",
      type: TaskType.TONE,
      isSelected: false,
    },
    {
      id: "examples",
      name: "Summary",
      type: TaskType.LENGTH,
      isSelected: false,
    },
  ]);

  // Current selected task
  private selectedTask = signal<TaskItem | null>(null);

  // Sample essay content
  private essayContent = signal<EssayContent | null>(null);

  // Generated status
  private isGenerated = signal<boolean>(false);

  // Expandable state for feature cards
  private expandableState = signal<ExpandableState>({
    isExpanded: false,
    contentType: "",
  });

  // Getters
  getTaskItems() {
    return this.taskItems;
  }
  getEssayContent() {
    return this.essayContent;
  }

  getIsGenerated() {
    return this.isGenerated;
  }

  getExpandableState() {
    return this.expandableState;
  }

  // Setters
  selectTask(taskId: string) {
    const updatedTasks = this.taskItems().map((task) => ({
      ...task,
      isSelected: task.id === taskId,
    }));

    this.taskItems.set(updatedTasks);
    this.selectedTask.set(
      updatedTasks.find((task) => task.id === taskId) || null,
    );

    // Auto-expand the corresponding feature card
    this.expandFeatureCard(taskId);
  }

  // Update task items
  updateTaskItems(tasks: TaskItem[]) {
    this.taskItems.set(tasks);
  }

  // Expandable state management
  expandFeatureCard(taskId: string) {
    this.expandableState.set({
      isExpanded: true,
      contentType: taskId,
    });
  }

  collapseFeatureCard() {
    this.expandableState.set({
      isExpanded: false,
      contentType: "",
    });
  }
  // Select task by type
  selectTaskByType(taskType: TaskType) {
    const updatedTasks = this.taskItems().map((task) => ({
      ...task,
      isSelected: task.type === taskType,
    }));

    this.taskItems.set(updatedTasks);
    const selectedTask = updatedTasks.find((task) => task.type === taskType);
    this.selectedTask.set(selectedTask || null);

    // Auto-expand the corresponding feature card
    if (selectedTask) {
      this.expandFeatureCard(selectedTask.id);
    }
  }

  // Clear task selection
  clearTaskSelection() {
    const updatedTasks = this.taskItems().map((task) => ({
      ...task,
      isSelected: false,
    }));
    this.taskItems.set(updatedTasks);
    this.selectedTask.set(null);
  }
}
