import { Injectable, signal } from "@angular/core";
import { Observable, of, delay } from "rxjs";
import {
  EssayFolder,
  EssayHistoryItem,
  DragDropEvent,
} from "@/app/interfaces/essay-folder.interface";

@Injectable({
  providedIn: "root",
})
export class EssayFolderService {
  // Mock data for demonstration - replace with actual API calls
  private mockFolders: EssayFolder[] = [
    {
      id: "folder-1",
      name: "Academic Research",
      parentId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      essayCount: 2,
      color: "#3B82F6",
    },
    {
      id: "folder-2",
      name: "Personal Projects",
      parentId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      essayCount: 0,
      color: "#10B981",
    },
    {
      id: "folder-3",
      name: "Research Papers",
      parentId: "folder-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      essayCount: 1,
      color: "#8B5CF6",
    },
  ];

  private mockEssays: EssayHistoryItem[] = [
    {
      id: "essay-1",
      title: "The Impact of Climate Change on Global Economics",
      topic: "Environmental Science",
      wordCount: 1200,
      lastModified: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      status: "in-progress",
      folderId: null,
    },
    {
      id: "essay-2",
      title: "Artificial Intelligence in Modern Healthcare",
      topic: "Technology & Medicine",
      wordCount: 800,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      status: "draft",
      folderId: "folder-1",
    },
    {
      id: "essay-3",
      title: "The Evolution of Social Media Marketing",
      topic: "Business & Marketing",
      wordCount: 1500,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: "completed",
      folderId: "folder-1",
    },
    {
      id: "essay-4",
      title: "Renewable Energy Solutions for Developing Countries",
      topic: "Environmental Policy",
      wordCount: 950,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      status: "completed",
      folderId: null,
    },
    {
      id: "essay-5",
      title: "Machine Learning Applications in Finance",
      topic: "Technology & Finance",
      wordCount: 1800,
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      status: "completed",
      folderId: "folder-3",
    },
  ];

  getFolders(): Observable<EssayFolder[]> {
    return of(this.mockFolders).pipe(delay(500));
  }

  getFoldersByParent(parentId: string | null): Observable<EssayFolder[]> {
    const folders = this.mockFolders.filter(
      (folder) => folder.parentId === parentId,
    );
    return of(folders).pipe(delay(300));
  }

  getEssays(): Observable<EssayHistoryItem[]> {
    return of(this.mockEssays).pipe(delay(1000));
  }

  getEssaysByFolder(folderId: string | null): Observable<EssayHistoryItem[]> {
    const essays = this.mockEssays.filter(
      (essay) => essay.folderId === folderId,
    );
    return of(essays).pipe(delay(300));
  }

  createFolder(name: string, parentId: string | null): Observable<EssayFolder> {
    const newFolder: EssayFolder = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      parentId: parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      essayCount: 0,
      color: this.getRandomFolderColor(),
    };

    // Add to mock data
    this.mockFolders.push(newFolder);

    return of(newFolder).pipe(delay(500));
  }

  renameFolder(folderId: string, newName: string): Observable<EssayFolder> {
    const folderIndex = this.mockFolders.findIndex((f) => f.id === folderId);
    if (folderIndex === -1) {
      throw new Error("Folder not found");
    }

    this.mockFolders[folderIndex] = {
      ...this.mockFolders[folderIndex],
      name: newName.trim(),
      updatedAt: new Date(),
    };

    return of(this.mockFolders[folderIndex]).pipe(delay(300));
  }

  deleteFolder(folderId: string): Observable<boolean> {
    const folder = this.mockFolders.find((f) => f.id === folderId);
    if (!folder) {
      throw new Error("Folder not found");
    }

    // Move all essays from this folder to its parent
    this.mockEssays.forEach((essay) => {
      if (essay.folderId === folderId) {
        essay.folderId = folder.parentId;
      }
    });

    // Move all subfolders to the parent
    this.mockFolders.forEach((f) => {
      if (f.parentId === folderId) {
        f.parentId = folder.parentId;
      }
    });

    // Remove the folder
    const folderIndex = this.mockFolders.findIndex((f) => f.id === folderId);
    this.mockFolders.splice(folderIndex, 1);

    return of(true).pipe(delay(300));
  }

  moveEssayToFolder(
    essayId: string,
    targetFolderId: string | null,
  ): Observable<boolean> {
    const essay = this.mockEssays.find((e) => e.id === essayId);
    if (!essay) {
      throw new Error("Essay not found");
    }

    const previousFolderId = essay.folderId;
    essay.folderId = targetFolderId;

    // Update folder counts
    this.updateFolderCounts(previousFolderId, targetFolderId);

    return of(true).pipe(delay(200));
  }

  isFolderNameUnique(
    name: string,
    parentId: string | null,
    excludeId?: string,
  ): boolean {
    const trimmedName = name.trim().toLowerCase();
    return !this.mockFolders.some(
      (folder) =>
        folder.parentId === parentId &&
        folder.name.toLowerCase() === trimmedName &&
        folder.id !== excludeId,
    );
  }

  getFolderById(folderId: string): EssayFolder | null {
    return this.mockFolders.find((f) => f.id === folderId) || null;
  }

  getFolderHierarchy(folderId: string): EssayFolder[] {
    const hierarchy: EssayFolder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = this.getFolderById(currentId);
      if (folder) {
        hierarchy.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return hierarchy;
  }

  searchEssays(query: string): Observable<EssayHistoryItem[]> {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) {
      return of([]);
    }

    const results = this.mockEssays.filter(
      (essay) =>
        essay.title.toLowerCase().includes(searchTerm) ||
        essay.topic.toLowerCase().includes(searchTerm),
    );

    return of(results).pipe(delay(300));
  }

  getEssayStats(): Observable<{
    total: number;
    draft: number;
    inProgress: number;
    completed: number;
    totalWords: number;
  }> {
    const stats = {
      total: this.mockEssays.length,
      draft: this.mockEssays.filter((e) => e.status === "draft").length,
      inProgress: this.mockEssays.filter((e) => e.status === "in-progress")
        .length,
      completed: this.mockEssays.filter((e) => e.status === "completed").length,
      totalWords: this.mockEssays.reduce(
        (sum, essay) => sum + essay.wordCount,
        0,
      ),
    };

    return of(stats).pipe(delay(200));
  }

  private updateFolderCounts(
    fromFolderId: string | null,
    toFolderId: string | null,
  ): void {
    // Decrease count for source folder
    if (fromFolderId) {
      const fromFolder = this.mockFolders.find((f) => f.id === fromFolderId);
      if (fromFolder && fromFolder.essayCount > 0) {
        fromFolder.essayCount--;
        fromFolder.updatedAt = new Date();
      }
    }

    // Increase count for target folder
    if (toFolderId) {
      const toFolder = this.mockFolders.find((f) => f.id === toFolderId);
      if (toFolder) {
        toFolder.essayCount++;
        toFolder.updatedAt = new Date();
      }
    }
  }

  private getRandomFolderColor(): string {
    const colors = [
      "#3B82F6", // Blue
      "#10B981", // Green
      "#8B5CF6", // Purple
      "#F59E0B", // Yellow
      "#EF4444", // Red
      "#06B6D4", // Cyan
      "#84CC16", // Lime
      "#F97316", // Orange
    ];

    return colors[Math.floor(Math.random() * colors.length)];
  }

  validateFolderName(name: string): { valid: boolean; error?: string } {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return { valid: false, error: "Folder name cannot be empty" };
    }

    if (trimmedName.length > 50) {
      return {
        valid: false,
        error: "Folder name must be 50 characters or less",
      };
    }

    if (/[<>:"/\\|?*]/.test(trimmedName)) {
      return { valid: false, error: "Folder name contains invalid characters" };
    }

    return { valid: true };
  }
}
