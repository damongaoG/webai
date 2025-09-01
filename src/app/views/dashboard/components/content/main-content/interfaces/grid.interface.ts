/**
 * Base interface for grid items that can be displayed in the unified grid
 */
export interface GridItem {
  id: string;
  text: string;
  isSelected?: boolean;
}

/**
 * Configuration interface for the unified grid component
 */
export interface UnifiedGridConfig {
  columns: number;
  gap: number;
  animationDuration: number;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

/**
 * Legacy configuration for arguments grid (for backward compatibility)
 */
export interface ArgumentsGridConfig {
  columns: number;
  gap: number;
  animationDuration: number;
}
