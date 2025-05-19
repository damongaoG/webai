import { Injectable, signal } from "@angular/core";

export interface TaskItem {
  id: string;
  name: string;
  isSelected: boolean;
}

export interface EssayContent {
  title: string;
  content: string;
}

@Injectable()
export class DashboardSharedService {
  // Available task items
  private taskItems = signal<TaskItem[]>([
    { id: "keywords", name: "关键词", isSelected: false },
    { id: "topic", name: "题目任务", isSelected: false },
    { id: "arguments", name: "使用论点", isSelected: false },
    { id: "review", name: "学术review", isSelected: false },
    { id: "cases", name: "相关案例", isSelected: false },
    { id: "examples", name: "example essay", isSelected: false },
  ]);

  // Current selected task
  private selectedTask = signal<TaskItem | null>(null);

  // Sample essay content
  private essayContent = signal<EssayContent | null>(null);

  // Generated status
  private isGenerated = signal<boolean>(false);

  // Getters
  getTaskItems() {
    return this.taskItems;
  }

  getSelectedTask() {
    return this.selectedTask;
  }

  getEssayContent() {
    return this.essayContent;
  }

  getIsGenerated() {
    return this.isGenerated;
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
  }

  generateContent() {
    if (!this.selectedTask()) return;

    // In a real application, this would likely be an API call
    // For demo purposes, we'll just set some sample content
    const sampleContent: Record<string, EssayContent> = {
      keywords: {
        title: "Keywords Sample Essay",
        content:
          "This is a sample essay based on the selected keywords. It demonstrates how keywords can be effectively incorporated into an academic essay.",
      },
      topic: {
        title: "Topic Discussion Sample",
        content:
          "This sample essay addresses the selected topic. It provides a structured approach to analyzing and discussing the given topic.",
      },
      arguments: {
        title: "Argumentative Sample Essay",
        content:
          "This sample demonstrates how to construct effective arguments in an academic essay. It shows the logical flow of presenting claims and supporting evidence.",
      },
      review: {
        title: "Academic Review Sample",
        content:
          "This is a sample academic review that critically evaluates relevant literature. It demonstrates the format and approach for writing academic reviews.",
      },
      cases: {
        title: "Case Study Analysis Sample",
        content:
          "This sample essay shows how to effectively analyze case studies. It demonstrates the structure and methodology for case analysis in academic writing.",
      },
      examples: {
        title: "Example Essay",
        content:
          "This is a comprehensive example essay that showcases proper academic writing style, structure, and formatting.",
      },
    };

    const selectedId = this.selectedTask()?.id || "";
    this.essayContent.set(sampleContent[selectedId]);
    this.isGenerated.set(true);
  }

  reset() {
    this.isGenerated.set(false);
    this.essayContent.set(null);
  }
}
