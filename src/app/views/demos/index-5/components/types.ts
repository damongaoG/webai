export type ToolType = {
  name: string;
  icon: string;
  iconClass: string;
};

export type FeatureType = {
  icon: string;
  title: string;
  description: string;
};

export type PricingType = {
  name: string;
  description: string;
  price: number;
  features: {
    name: string;
    icon: string;
    variant: string;
  }[];
};
