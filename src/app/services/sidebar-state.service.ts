import { Injectable, signal, computed } from "@angular/core";

// Interface for menu item structure
export interface MenuItem {
  id: string;
  name: string;
  icon?: string;
  isExpanded: boolean;
  children?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  name: string;
  icon?: string;
}

// Enum for main content types
export enum ContentType {
  DASHBOARD = "dashboard",
  REWRITE_MODEL = "rewrite-model",
  ESSAY_MODEL = "essay-model",
  REWRITE_HISTORY = "rewrite-history",
  ESSAY_HISTORY = "essay-history",
  REWRITE_NEW = "rewrite-new",
  ESSAY_NEW = "essay-new",
}

@Injectable({
  providedIn: "root",
})
export class SidebarStateService {
  private readonly _menuItems = signal<MenuItem[]>([
    {
      id: "dashboard",
      name: "Dashboard",
      icon: "layout-dashboard",
      isExpanded: false,
    },
    {
      id: "rewrite-model",
      name: "Rewrite Model",
      icon: "pencil",
      isExpanded: false,
      children: [
        { id: "rewrite-new", name: "New", icon: "plus" },
        { id: "rewrite-history", name: "History", icon: "history" },
      ],
    },
    {
      id: "essay-model",
      name: "Essay Model",
      icon: "file-text",
      isExpanded: false,
      children: [
        { id: "essay-new", name: "New", icon: "plus" },
        { id: "essay-history", name: "History", icon: "history" },
      ],
    },
  ]);

  private readonly _selectedContent = signal<ContentType>(
    ContentType.DASHBOARD,
  );

  // Sidebar collapse state management
  private readonly _isSidebarCollapsed = signal<boolean>(false);

  // Public computed signals for component consumption
  public readonly menuItems = computed(() => this._menuItems());
  public readonly selectedContent = computed(() => this._selectedContent());
  public readonly isSidebarCollapsed = computed(() =>
    this._isSidebarCollapsed(),
  );

  // Toggle sidebar collapse/expand state
  toggleSidebarCollapse(): void {
    this._isSidebarCollapsed.update((collapsed) => !collapsed);

    // When sidebar is collapsed, close all expanded menus
    if (this._isSidebarCollapsed()) {
      this._menuItems.update((items) =>
        items.map((item) => ({
          ...item,
          isExpanded: false,
        })),
      );
    }
  }

  toggleMenuExpansion(menuId: string): void {
    this._menuItems.update((items) =>
      items.map((item) => ({
        ...item,
        isExpanded: item.id === menuId ? !item.isExpanded : false, // Only one menu can be expanded at a time
      })),
    );
  }

  selectMainMenuItem(menuId: string): void {
    // Set the selected content based on menu selection
    let contentType: ContentType;

    switch (menuId) {
      case "dashboard":
        contentType = ContentType.DASHBOARD;
        break;
      case "rewrite-model":
        contentType = ContentType.REWRITE_MODEL;
        break;
      case "essay-model":
        contentType = ContentType.ESSAY_MODEL;
        break;
      default:
        contentType = ContentType.DASHBOARD;
    }

    this._selectedContent.set(contentType);

    // Expand the selected menu if it has children, otherwise collapse all
    this._menuItems.update((items) =>
      items.map((item) => ({
        ...item,
        isExpanded: !!(item.id === menuId && item.children),
      })),
    );
  }

  selectSubMenuItem(parentId: string, subItemId: string): void {
    let contentType: ContentType;

    if (parentId === "rewrite-model" && subItemId === "rewrite-new") {
      contentType = ContentType.REWRITE_NEW;
    } else if (
      parentId === "rewrite-model" &&
      subItemId === "rewrite-history"
    ) {
      contentType = ContentType.REWRITE_HISTORY;
    } else if (parentId === "essay-model" && subItemId === "essay-new") {
      contentType = ContentType.ESSAY_NEW;
    } else if (parentId === "essay-model" && subItemId === "essay-history") {
      contentType = ContentType.ESSAY_HISTORY;
    } else {
      return; // Invalid combination
    }

    this._selectedContent.set(contentType);
  }

  isMenuItemSelected(menuId: string): boolean {
    const currentContent = this._selectedContent();

    switch (menuId) {
      case "dashboard":
        return currentContent === ContentType.DASHBOARD;
      case "rewrite-model":
        return (
          currentContent === ContentType.REWRITE_MODEL ||
          currentContent === ContentType.REWRITE_NEW ||
          currentContent === ContentType.REWRITE_HISTORY
        );
      case "essay-model":
        return (
          currentContent === ContentType.ESSAY_MODEL ||
          currentContent === ContentType.ESSAY_NEW ||
          currentContent === ContentType.ESSAY_HISTORY
        );
      default:
        return false;
    }
  }

  isSubMenuItemSelected(subItemId: string): boolean {
    const currentContent = this._selectedContent();
    return (
      (subItemId === "rewrite-new" &&
        currentContent === ContentType.REWRITE_NEW) ||
      (subItemId === "rewrite-history" &&
        currentContent === ContentType.REWRITE_HISTORY) ||
      (subItemId === "essay-new" && currentContent === ContentType.ESSAY_NEW) ||
      (subItemId === "essay-history" &&
        currentContent === ContentType.ESSAY_HISTORY)
    );
  }
}
