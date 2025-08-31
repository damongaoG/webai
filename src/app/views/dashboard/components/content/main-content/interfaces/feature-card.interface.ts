import { ExpandableState } from "./keyword.interface";
import { ExpandableState as SharedExpandableState } from "../../dashboard-shared.service";

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

export type CardId = "keywords" | "arguments" | "references" | "casestudies";
