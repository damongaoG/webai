import type { FaqType, FooterLinkType } from "@/app/types";
import type { FeatureType, PricingType, ToolType } from "./types";

export const tools: ToolType[] = [
  {
    name: "Social Media",
    icon: "dribbble",
    iconClass: "bg-red-500/20 text-red-500",
  },
  {
    name: "Design",
    icon: "component",
    iconClass: "bg-sky-500/20 text-sky-500",
  },
  {
    name: "Coding",
    icon: "code-xml",
    iconClass: "bg-default-500/20 text-default-500",
  },
  {
    name: "Marketing",
    icon: "badge-dollar-sign",
    iconClass: "bg-indigo-500/20 text-indigo-500",
  },
  {
    name: "Seo",
    icon: "aperture",
    iconClass: "bg-yellow-500/20 text-yellow-500",
  },
  {
    name: "Design Builder",
    icon: "compass",
    iconClass: "bg-teal-500/20 text-teal-500",
  },
  {
    name: "Free Ai Image",
    icon: "image",
    iconClass: "bg-pink-500/20 text-pink-500",
  },
  {
    name: "Free Repository",
    icon: "github",
    iconClass: "bg-white/20 text-white",
  },
];

export const features: FeatureType[] = [
  {
    icon: "file-text",
    title: "Articles and Blog Posts",
    description:
      "AI can create informative articles or blog posts on a wide range of topics.",
  },
  {
    icon: "pen",
    title: "Creative Writing",
    description:
      "AI can generate short stories, poetry, or other creative pieces.",
  },
  {
    icon: "database",
    title: "Data Analysis and Reporting",
    description:
      "AI can analyze data and generate reports with insights and Financial Reports.",
  },
  {
    icon: "gitlab",
    title: "Code and Programming",
    description:
      "AI can generate code snippets in various programming languages.",
  },
  {
    icon: "palette",
    title: "Design and Visual Content",
    description: "AI can generate images, logos, and other visual content.",
  },
  {
    icon: "case-sensitive",
    title: "Language Translation",
    description:
      "AI can translate text from one language to another and can any language of your choice.",
  },
];

export const pricingPlans: PricingType[] = [
  {
    name: "Essential",
    description: "Our new Customers for a free one month of service offers.",
    price: 19.0,
    features: [
      {
        name: "All limited links",
        icon: "circle-check",
        variant: "text-primary",
      },
      {
        name: "Own analytics platform",
        icon: "circle-check",
        variant: "text-primary",
      },
      { name: "Chat support", icon: "circle-check", variant: "text-primary" },
      {
        name: "Optimize hashtags",
        icon: "circle-check",
        variant: "text-primary",
      },
      { name: "Mobile app", icon: "circle-x", variant: "text-red-500" },
      { name: "Unlimited users", icon: "circle-x", variant: "text-red-500" },
    ],
  },
  {
    name: "Premium",
    description: "Our new Customers for a free one month of service offers.",
    price: 29.0,
    features: [
      {
        name: "All limited links",
        icon: "circle-check",
        variant: "text-primary",
      },
      {
        name: "Own analytics platform",
        icon: "circle-check",
        variant: "text-primary",
      },
      { name: "Chat support", icon: "circle-check", variant: "text-primary" },
      {
        name: "Optimize hashtags",
        icon: "circle-check",
        variant: "text-primary",
      },
      { name: "Mobile app", icon: "circle-check", variant: "text-primary" },
      {
        name: "Unlimited users",
        icon: "circle-check",
        variant: "text-primary",
      },
    ],
  },
];

export const faqsData: FaqType[] = [
  {
    question: "Who are produces sit pleasure?",
    answer:
      "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem",
  },
  {
    question: "What is quo voluptas nulla pariatur?",
    answer:
      "Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Duis leo. Sed fringilla mauris sit amet nibh.",
  },
  {
    question: "How to do transactions using iMbank?",
    answer:
      "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem",
  },
  {
    question: "How to activate iMbank service?",
    answer:
      "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem",
  },
  {
    question: "Who is eligible to open iMbank account?",
    answer:
      "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem",
  },
  {
    question: "Will I be given a passbook?",
    answer:
      "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem",
  },
];

export const footerLinks: FooterLinkType[] = [
  {
    title: "About Us",
    links: [
      { name: "Support Center" },
      { name: "Customer Support" },
      { name: "About Us" },
      { name: "Copyright" },
      { name: "Popular Campaign" },
      { name: "Return Policy" },
      { name: "Privacy Policy" },
      { name: "Terms & Conditions" },
    ],
  },
  {
    title: "My Account",
    links: [
      { name: "Press Inquiries" },
      { name: "Social Media Directories" },
      { name: "Images & B-roll" },
      { name: "Site Map" },
    ],
  },
];
