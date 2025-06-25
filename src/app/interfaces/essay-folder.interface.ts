// Essay folder interface definitions
export interface EssayFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  essayCount: number;
  color?: string; // Optional folder color for UI
}

// Extended essay history item interface
export interface EssayHistoryItem {
  id: string;
  title: string;
  topic: string;
  wordCount: number;
  lastModified: Date;
  status: "draft" | "completed" | "in-progress";
  folderId: string | null; // Associated folder ID
  isActive?: boolean;
}

// Breadcrumb navigation item
export interface BreadcrumbItem {
  id: string;
  name: string;
  isActive: boolean;
}

// View mode for essay history
export type ViewMode = "list" | "folder";

// Drag and drop events
export interface DragDropEvent {
  essayId: string;
  targetFolderId: string | null;
  previousFolderId: string | null;
}

// Folder operation types
export type FolderOperation = "create" | "rename" | "delete" | "move";
