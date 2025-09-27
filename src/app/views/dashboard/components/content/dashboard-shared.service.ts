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
    // {
    //   id: "topic",
    //   name: "Assignment task",
    //   type: TaskType.CONTENT,
    //   isSelected: false,
    // },
    {
      id: "arguments",
      name: "Use arguments",
      type: TaskType.STYLE,
      isSelected: false,
    },
    {
      id: "references",
      name: "References",
      type: TaskType.GRAMMAR,
      isSelected: false,
    },
    {
      id: "casestudies",
      name: "Relevant case studies",
      type: TaskType.TONE,
      isSelected: false,
    },
    {
      id: "summary",
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

  // Persistent lock specifically for summary card: hides undo and disables expand
  private summaryLocked = signal<boolean>(false);

  // Expandable state for feature cards
  private expandableState = signal<ExpandableState>({
    isExpanded: false,
    contentType: "",
  });

  // One-shot preloaded summary text (used after redo from cases)
  private preloadedSummaryText = signal<string>("");

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

  /**
   * Preload summary text to be consumed by the summary card upon expand.
   */
  setPreloadedSummaryText(text: string): void {
    this.preloadedSummaryText.set(text ?? "");
  }

  /**
   * Read without clearing. Useful to decide whether to consume.
   */
  peekPreloadedSummaryText(): string {
    return this.preloadedSummaryText();
  }

  /**
   * Consume and clear the preloaded summary text.
   */
  takePreloadedSummaryText(): string {
    const value = this.preloadedSummaryText();
    this.preloadedSummaryText.set("");
    return value;
  }

  /**
   * Summary-specific lock for suppressing Undo and expand on summary card
   */
  setSummaryLocked(locked: boolean): void {
    this.summaryLocked.set(locked);
  }

  isSummaryLocked(): boolean {
    return this.summaryLocked();
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

  /**
   * Set generated flag for Sample Essay visibility
   */
  setIsGenerated(isGenerated: boolean): void {
    this.isGenerated.set(isGenerated);
  }

  /**
   * Replace the entire essay content (title and body)
   */
  setEssay(title: string | null, content: string | null): void {
    this.essayContent.set({
      title: title ?? "",
      content: content ?? "",
    });
  }

  /**
   * Replace only the essay body content, keeping current title if any
   */
  setEssayContent(content: string): void {
    const current = this.essayContent();
    this.essayContent.set({
      title: current?.title ?? "",
      content: content ?? "",
    });
  }

  /**
   * Append text to the essay body content sequentially (for streaming)
   */
  appendEssayContent(text: string): void {
    const current = this.essayContent();
    const nextContent = (current?.content ?? "") + (text ?? "");
    this.essayContent.set({
      title: current?.title ?? "",
      content: nextContent,
    });
  }

  /**
   * Clear the essay body content while preserving current title if present
   */
  clearEssayContent(): void {
    const current = this.essayContent();
    this.essayContent.set({
      title: current?.title ?? "",
      content: "",
    });
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
