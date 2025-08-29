export type CategoriesType = {
  image: string;
  avatar: string;
  username: string;
  name: string;
  currentBid: number;
  lastBid: number;
  hasTime?: boolean;
};

export type SellerType = {
  images: string[];
  avatar: string;
  name: string;
  amount: number;
};

export type BrowseByCategoryType = {
  image: string;
  category: string;
};

export type FaqType = {
  id: number;
  question: string;
  answer: string;
};

export type BlogType = {
  date: string;
  title: string;
  description: string;
  image: string;
};

export type FooterLinkType = {
  title: string;
  links: {
    url?: string;
    name: string;
  }[];
};
