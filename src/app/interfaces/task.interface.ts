// Task type enum to identify different types of tasks
export enum TaskType {
  KEYWORD = "keyword",
  CONTENT = "content",
  GRAMMAR = "grammar",
  STYLE = "style",
  TONE = "tone",
  LENGTH = "length",
}

// Interface for task selection event
export interface TaskSelectionEvent {
  taskType: TaskType;
  isExpanded: boolean;
  source?: string;
}

// Interface for task item
export interface TaskItem {
  id: string;
  name: string;
  type: TaskType;
  isSelected: boolean;
  isHovered: boolean;
  icon?: string;
  selectedIcon?: string;
}
