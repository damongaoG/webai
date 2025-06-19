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
  REWRITE_MODEL = "rewrite-model",
  ESSAY_MODEL = "essay-model",
  REWRITE_HISTORY = "rewrite-history",
  ESSAY_HISTORY = "essay-history",
}

@Injectable({
  providedIn: "root",
})
export class SidebarStateService {
  private readonly _menuItems = signal<MenuItem[]>([
    {
      id: "rewrite-model",
      name: "Rewrite Model",
      icon: "edit",
      isExpanded: false,
      children: [{ id: "rewrite-history", name: "History", icon: "history" }],
    },
    {
      id: "essay-model",
      name: "Essay Model",
      icon: "file-text",
      isExpanded: false,
      children: [{ id: "essay-history", name: "History", icon: "history" }],
    },
  ]);

  private readonly _selectedContent = signal<ContentType>(
    ContentType.REWRITE_MODEL,
  );

  // Public computed signals for component consumption
  public readonly menuItems = computed(() => this._menuItems());
  public readonly selectedContent = computed(() => this._selectedContent());

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
    const contentType =
      menuId === "rewrite-model"
        ? ContentType.REWRITE_MODEL
        : ContentType.ESSAY_MODEL;

    this._selectedContent.set(contentType);

    // Expand the selected menu if not already expanded
    this._menuItems.update((items) =>
      items.map((item) => ({
        ...item,
        isExpanded: item.id === menuId,
      })),
    );
  }

  selectSubMenuItem(parentId: string, subItemId: string): void {
    let contentType: ContentType;

    if (parentId === "rewrite-model" && subItemId === "rewrite-history") {
      contentType = ContentType.REWRITE_HISTORY;
    } else if (parentId === "essay-model" && subItemId === "essay-history") {
      contentType = ContentType.ESSAY_HISTORY;
    } else {
      return; // Invalid combination
    }

    this._selectedContent.set(contentType);
  }

  isMenuItemSelected(menuId: string): boolean {
    const currentContent = this._selectedContent();
    return (
      (menuId === "rewrite-model" &&
        (currentContent === ContentType.REWRITE_MODEL ||
          currentContent === ContentType.REWRITE_HISTORY)) ||
      (menuId === "essay-model" &&
        (currentContent === ContentType.ESSAY_MODEL ||
          currentContent === ContentType.ESSAY_HISTORY))
    );
  }

  isSubMenuItemSelected(subItemId: string): boolean {
    const currentContent = this._selectedContent();
    return (
      (subItemId === "rewrite-history" &&
        currentContent === ContentType.REWRITE_HISTORY) ||
      (subItemId === "essay-history" &&
        currentContent === ContentType.ESSAY_HISTORY)
    );
  }
}
