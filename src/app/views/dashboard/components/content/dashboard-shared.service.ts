import { Injectable, signal } from "@angular/core";

export interface TaskItem {
  id: string;
  name: string;
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
    { id: "keywords", name: "Keywords", isSelected: false },
    { id: "topic", name: "Assignment task", isSelected: false },
    { id: "arguments", name: "Use arguments", isSelected: false },
    { id: "review", name: "References", isSelected: false },
    { id: "cases", name: "Relevant case studies", isSelected: false },
    { id: "examples", name: "Summary", isSelected: false },
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

  toggleFeatureCard(taskId: string) {
    const currentState = this.expandableState();
    if (currentState.isExpanded && currentState.contentType === taskId) {
      this.collapseFeatureCard();
    } else {
      this.expandFeatureCard(taskId);
    }
  }
}
