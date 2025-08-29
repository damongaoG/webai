import type {
  BlogType,
  BrowseByCategoryType,
  CategoriesType,
  FaqType,
  FooterLinkType,
  SellerType,
} from "./types";

export const categories: CategoriesType[] = [
  {
    image: "assets/images/nft/art/4.png",
    avatar: "assets/images/avatars/img-1.png",
    username: "@Nikom",
    name: "Half Hair",
    currentBid: 20.5,
    lastBid: 25.04,
    hasTime: true,
  },
  {
    image: "assets/images/nft/art/5.png",
    avatar: "assets/images/avatars/img-3.png",
    username: "@Mexi",
    name: "Headphone Monkey",
    currentBid: 12.5,
    lastBid: 25.04,
  },
  {
    image: "assets/images/nft/art/6.png",
    avatar: "assets/images/avatars/img-4.png",
    username: "@Astro",
    name: "Goggles Monkey",
    currentBid: 14.8,
    lastBid: 12.04,
  },
  {
    image: "assets/images/nft/art/7.png",
    avatar: "assets/images/avatars/img-5.png",
    username: "@Aliza",
    name: "Cute Girl",
    currentBid: 18.0,
    lastBid: 32.06,
    hasTime: true,
  },
  {
    image: "assets/images/nft/art/8.png",
    avatar: "assets/images/avatars/img-8.png",
    username: "@Tony",
    name: "Sky Hair Girl",
    currentBid: 20.42,
    lastBid: 18.96,
  },
  {
    image: "assets/images/nft/art/9.png",
    avatar: "assets/images/avatars/img-9.png",
    username: "@Alabto",
    name: "Cartoon Couple",
    currentBid: 24.96,
    lastBid: 40.22,
  },
  {
    image: "assets/images/nft/art/14.png",
    avatar: "assets/images/avatars/img-10.png",
    username: "@Minato",
    name: "Skeleton",
    currentBid: 12.5,
    lastBid: 25.04,
    hasTime: true,
  },
  {
    image: "assets/images/nft/art/22.png",
    avatar: "assets/images/avatars/img-11.png",
    username: "@Tamari",
    name: "Businessman Monkey",
    currentBid: 42.52,
    lastBid: 20.42,
  },
];

export const sellersData: SellerType[] = [
  {
    images: [
      "assets/images/nft/art/4.png",
      "assets/images/nft/art/5.png",
      "assets/images/nft/art/6.png",
    ],
    avatar: "assets/images/avatars/img-1.png",
    name: "Nikom Petroy",
    amount: 60000,
  },
  {
    images: [
      "assets/images/nft/art/7.png",
      "assets/images/nft/art/8.png",
      "assets/images/nft/art/9.png",
    ],
    avatar: "assets/images/avatars/img-2.png",
    name: "Mexi Luna",
    amount: 55000,
  },
  {
    images: [
      "assets/images/nft/art/10.png",
      "assets/images/nft/art/11.png",
      "assets/images/nft/art/12.png",
    ],
    avatar: "assets/images/avatars/img-4.png",
    name: "Astro Stark",
    amount: 52000,
  },
  {
    images: [
      "assets/images/nft/art/13.png",
      "assets/images/nft/art/14.png",
      "assets/images/nft/art/15.png",
    ],
    avatar: "assets/images/avatars/img-5.png",
    name: "Aliza Spencer",
    amount: 48500,
  },
  {
    images: [
      "assets/images/nft/art/16.png",
      "assets/images/nft/art/17.png",
      "assets/images/nft/art/18.png",
    ],
    avatar: "assets/images/avatars/img-6.png",
    name: "Tony Stark",
    amount: 45200,
  },
  {
    images: [
      "assets/images/nft/art/20.png",
      "assets/images/nft/art/21.png",
      "assets/images/nft/art/22.png",
    ],
    avatar: "assets/images/avatars/img-8.png",
    name: "Minato Namikaze",
    amount: 45100,
  },
];

export const browseByCategoryData: BrowseByCategoryType[] = [
  {
    image: "assets/images/nft/art/19.png",
    category: "Art",
  },
  {
    image: "assets/images/nft/art/5.png",
    category: "Music",
  },
  {
    image: "assets/images/nft/art/14.png",
    category: "Utility",
  },
];

export const faqData: FaqType[] = [
  {
    id: 1,
    question: "Will you support my language?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
  {
    id: 2,
    question: "Do you also provide subtitles?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
  {
    id: 3,
    question: "How do I get started?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
  {
    id: 4,
    question: "Do you have any samples?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
  {
    id: 5,
    question: "Can I get custom templates?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
  {
    id: 6,
    question: "What types of videos can I upload?",
    answer:
      "You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.",
  },
];

export const blogs: BlogType[] = [
  {
    date: "27 Aug 2021",
    title: "The Beginner's to creating & selling digital NFTs",
    description:
      "suscipit eget imperdiet nec imperdiet iaculis ipsum. Sed aliquam ultrices mauris.",
    image: "assets/images/nft/bg/1.png",
  },
  {
    date: "31 Jan 2022",
    title: "7 Reasons to sell your NFTs on openSea",
    description:
      "Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero.",
    image: "assets/images/nft/bg/2.png",
  },
];

export const footerLinks: FooterLinkType[] = [
  {
    title: "Marketplace",
    links: [{ name: "All NFTs" }, { name: "New" }, { name: "Arts" }],
  },
  {
    title: "Status",
    links: [{ name: "Rankings" }, { name: "Activity" }],
  },
  {
    title: "Resources",
    links: [
      { name: "Help Center" },
      { name: "Suggestions" },
      { name: "Newsletter" },
    ],
  },
  {
    title: "Company",
    links: [{ name: "About" }, { name: "Careers" }],
  },
];
