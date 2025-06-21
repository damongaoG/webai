import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import {
  SidebarStateService,
  MenuItem,
  SubMenuItem,
} from "@/app/services/sidebar-state.service";

@Component({
  selector: "app-dashboard-sidebar",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="sidebar h-screen bg-black text-white transition-all duration-300 ease-in-out"
      [class.w-64]="!sidebarState.isSidebarCollapsed()"
      [class.w-16]="sidebarState.isSidebarCollapsed()"
    >
      <!-- Logo section -->
      <div
        class="flex items-center p-4 border-b border-gray-700"
        [class.justify-center]="sidebarState.isSidebarCollapsed()"
      >
        <div
          class="logo-container h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0"
          [title]="sidebarState.isSidebarCollapsed() ? 'Tudor AI' : ''"
        >
          <lucide-angular
            name="leaf"
            class="h-6 w-6 text-white"
          ></lucide-angular>
        </div>
        @if (!sidebarState.isSidebarCollapsed()) {
          <div class="ml-3 text-xl font-semibold text-white">Tudor AI</div>
        }
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-6">
        <div class="px-2">
          @for (menuItem of sidebarState.menuItems(); track menuItem.id) {
            <div class="mb-2">
              <!-- Main Menu Item -->
              <div
                class="menu-item flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-800 relative"
                [class.active]="sidebarState.isMenuItemSelected(menuItem.id)"
                [class.expanded]="
                  menuItem.isExpanded && !sidebarState.isSidebarCollapsed()
                "
                [class.justify-center]="sidebarState.isSidebarCollapsed()"
                [title]="sidebarState.isSidebarCollapsed() ? menuItem.name : ''"
                (click)="onMainMenuClick(menuItem)"
              >
                <div
                  class="flex items-center"
                  [class.w-full]="!sidebarState.isSidebarCollapsed()"
                >
                  <div class="menu-icon-container flex-shrink-0">
                    <lucide-angular
                      [name]="menuItem.icon || 'circle'"
                      class="h-5 w-5"
                      [class.text-green-400]="
                        sidebarState.isMenuItemSelected(menuItem.id)
                      "
                      [class.text-gray-400]="
                        !sidebarState.isMenuItemSelected(menuItem.id)
                      "
                    ></lucide-angular>
                  </div>
                  @if (!sidebarState.isSidebarCollapsed()) {
                    <span
                      class="ml-3 text-sm font-medium transition-colors"
                      [class.text-green-400]="
                        sidebarState.isMenuItemSelected(menuItem.id)
                      "
                      [class.text-white]="
                        !sidebarState.isMenuItemSelected(menuItem.id)
                      "
                    >
                      {{ menuItem.name }}
                    </span>
                  }
                </div>

                <!-- Expand/Collapse Arrow (only visible when not collapsed) -->
                @if (!sidebarState.isSidebarCollapsed() && menuItem.children) {
                  <div class="arrow-container">
                    <lucide-angular
                      name="chevron-right"
                      class="h-4 w-4 text-gray-400 transition-transform duration-200"
                      [class.rotate-90]="menuItem.isExpanded"
                    ></lucide-angular>
                  </div>
                }

                <!-- Tooltip for collapsed state -->
                @if (sidebarState.isSidebarCollapsed()) {
                  <div
                    class="tooltip absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 invisible transition-all duration-200 whitespace-nowrap z-50"
                  >
                    {{ menuItem.name }}
                  </div>
                }
              </div>

              <!-- Sub Menu Items (Children) - Only visible when expanded and not collapsed -->
              @if (
                menuItem.isExpanded &&
                menuItem.children &&
                !sidebarState.isSidebarCollapsed()
              ) {
                <div
                  class="submenu-container mt-2 ml-4 border-l border-gray-700 pl-4"
                >
                  @for (subItem of menuItem.children; track subItem.id) {
                    <div
                      class="submenu-item flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-800"
                      [class.active-submenu]="
                        sidebarState.isSubMenuItemSelected(subItem.id)
                      "
                      (click)="onSubMenuClick(menuItem.id, subItem)"
                    >
                      <div class="submenu-icon-container">
                        <lucide-angular
                          [name]="subItem.icon || 'circle'"
                          class="h-4 w-4"
                          [class.text-green-400]="
                            sidebarState.isSubMenuItemSelected(subItem.id)
                          "
                          [class.text-gray-400]="
                            !sidebarState.isSubMenuItemSelected(subItem.id)
                          "
                        ></lucide-angular>
                      </div>
                      <span
                        class="ml-3 text-sm transition-colors"
                        [class.text-green-400]="
                          sidebarState.isSubMenuItemSelected(subItem.id)
                        "
                        [class.text-gray-300]="
                          !sidebarState.isSubMenuItemSelected(subItem.id)
                        "
                      >
                        {{ subItem.name }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </nav>
    </div>
  `,
  styles: [
    `
      .sidebar {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        font-family: "Source Han Sans CN", sans-serif;
        overflow: hidden;
      }

      .menu-item {
        position: relative;
      }

      .menu-item.active {
        background-color: rgba(5, 167, 111, 0.1);
        border-left: 3px solid #05a76f;
      }

      .menu-item.expanded {
        background-color: rgba(5, 167, 111, 0.05);
      }

      .submenu-item {
        position: relative;
      }

      .submenu-item.active-submenu {
        background-color: rgba(5, 167, 111, 0.15);
        border-left: 2px solid #05a76f;
      }

      .submenu-container {
        animation: slideDown 0.2s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .arrow-container {
        transition: transform 0.2s ease;
      }

      .menu-icon-container,
      .submenu-icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Hover effects */
      .menu-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      .menu-item:hover .tooltip {
        opacity: 1;
        visibility: visible;
      }

      .submenu-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }

      /* Active state overrides hover */
      .menu-item.active:hover {
        background-color: rgba(5, 167, 111, 0.15);
      }

      .submenu-item.active-submenu:hover {
        background-color: rgba(5, 167, 111, 0.2);
      }

      /* Tooltip styling */
      .tooltip {
        pointer-events: none;
      }

      /* Collapsed state adjustments */
      .sidebar.w-16 .menu-item {
        justify-content: center;
      }

      .sidebar.w-16 .logo-container {
        margin: 0 auto;
      }
    `,
  ],
})
export class DashboardSidebarComponent {
  protected readonly sidebarState = inject(SidebarStateService);

  onMainMenuClick(menuItem: MenuItem): void {
    // In collapsed state, only select the menu item without expanding
    if (this.sidebarState.isSidebarCollapsed()) {
      this.sidebarState.selectMainMenuItem(menuItem.id);
    } else {
      // In expanded state, handle normal menu expansion/selection
      if (menuItem.children) {
        this.sidebarState.toggleMenuExpansion(menuItem.id);
      } else {
        this.sidebarState.selectMainMenuItem(menuItem.id);
      }
    }
  }

  onSubMenuClick(parentId: string, subItem: SubMenuItem): void {
    this.sidebarState.selectSubMenuItem(parentId, subItem.id);
  }
}
