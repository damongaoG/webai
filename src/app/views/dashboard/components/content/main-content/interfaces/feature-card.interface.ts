import { ExpandableState } from "./keyword.interface";

export interface FeatureCard {
  id: string;
  title: string;
  iconPath: string;
  iconAlt: string;
  additionalClasses?: string;
}

export interface CardState {
  showGradient: boolean;
  isPersistent: boolean;
  expandable: ExpandableState;
}

export type CardId =
  | "keywords"
  | "assignment"
  | "arguments"
  | "references"
  | "casestudies";
