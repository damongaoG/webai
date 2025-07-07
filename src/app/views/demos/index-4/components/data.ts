import type {
  FaqType,
  FeatureType,
  PricingType,
  TestimonialType,
  ToolType,
  TopicType,
} from "./types";

export const aiTools: ToolType[] = [
  {
    icon: "tags",
    title: "Smart Keyword Extraction",
    description:
      "Just enter your title — AI instantly generates key concepts to guide your writing and spark inspiration.",
  },
  {
    icon: "git-branch",
    title: "Precise Argument Generation",
    description:
      "Turn keywords into clear, well-structured arguments with one click, making it easy to build a strong essay framework.",
  },
  {
    icon: "folder-open",
    title: "Rich Case Support",
    description:
      "Each argument comes with relevant, real-world examples to strengthen your points and add credibility to your writing.",
  },
  {
    icon: "file-text",
    title: "Auto Conclusion & Summary",
    description:
      "Automatically generate insightful conclusions and summaries to complete your essay with clarity and coherence.",
  },
];

export const features: FeatureType[] = [
  {
    icon: "shield-check",
    name: "Bypass AI Detection with Human-Like Writing",
    description:
      "Advanced rewriting techniques to help your content sound natural and undetectable.",
  },
  {
    icon: "list-checks",
    name: "Step-by-Step Problem Solving",
    description:
      "Input a question, and get structured, easy-to-understand explanations — great for academic subjects.",
  },
  {
    icon: "zap",
    name: "Lightning-Fast Essay Drafts",
    description:
      "Go from title to complete essay structure in minutes — powered by smart, guided workflows.",
  },
  {
    icon: "pen-tool",
    name: "Zero Writing Blocks",
    description:
      "Always know what to write next — AI guides you through the entire process.",
  },
];

export const trendingTopics: TopicType[] = [
  {
    id: 1,
    title: "Wax layer",
    description: "Pressure clean, sponge art, string art, army",
    avatars: [
      "assets/images/avatars/img-2.png",
      "assets/images/avatars/img-1.png",
      "assets/images/avatars/img-3.png",
    ],
  },
  {
    id: 2,
    title: "Crowd Defence",
    description: "attack other gang, big, army, Crowd evolution",
    avatars: [
      "assets/images/avatars/img-4.png",
      "assets/images/avatars/img-5.png",
    ],
  },
  {
    id: 3,
    title: "Spinner blade",
    description: "beyblade games, fidget spinner, spinner battle",
    avatars: [
      "assets/images/avatars/img-6.png",
      "assets/images/avatars/img-7.png",
      "assets/images/avatars/img-8.png",
      "assets/images/avatars/img-5.png",
    ],
  },
  {
    id: 4,
    title: "Restaurant game",
    description: "Cooking madness, cooking, cafe, new hotel",
    avatars: [
      "assets/images/avatars/img-8.png",
      "assets/images/avatars/img-4.png",
      "assets/images/avatars/img-6.png",
    ],
  },
  {
    id: 5,
    title: "entire marvel universe",
    description: "Marvel, mutant ninja turtles, super heroes",
    avatars: ["assets/images/avatars/img-1.png"],
  },
  {
    id: 6,
    title: "Draw bridge",
    description: "road draw, draw rider, build bridge , build",
    avatars: [
      "assets/images/avatars/img-2.png",
      "assets/images/avatars/img-6.png",
      "assets/images/avatars/img-3.png",
    ],
  },
];

export const userTestimonialData: TestimonialType[] = [
  {
    name: "Ryan Delk",
    avatar: "assets/images/avatars/img-1.png",
    description:
      "I've tried other AI writing tools before, but this one is by far the best. The language is sophisticated and engaging, and it's helped me take my content to the next level.",
  },
  {
    name: "Marsel Fischer",
    avatar: "assets/images/avatars/img-2.png",
    description:
      "As a content marketer, I'm always looking for ways to streamline my workflow and create high-quality content. I don't know how I ever managed without it.",
  },
  {
    name: "John Tayes",
    avatar: "assets/images/avatars/img-3.png",
    description:
      "The solutions offered by your AI chatbots are truly impressive! We are able to communicate with our customers faster and more interactively.",
  },
  {
    name: "Ryan Jonas",
    avatar: "assets/images/avatars/img-4.png",
    description:
      "I've tried other AI writing tools before, but this one is by far the best. The language is sophisticated and engaging, and it's helped me take my content to the next level.",
  },
  {
    name: "Randy Hilarski",
    avatar: "assets/images/avatars/img-5.png",
    description:
      "I was surprised by the ease and speed of the video editing service based on AI technology from this site. The results are amazing and very satisfying.",
  },
  {
    name: "Jonathan Simcoe",
    avatar: "assets/images/avatars/img-6.png",
    description:
      "The solutions offered by your AI chatbots are truly impressive! We are able to communicate with our customers faster and more interactively.",
  },
];

export const pricingPlans: PricingType[] = [
  {
    name: "Free",
    price: 0,
    features: ["1 user", "Plan features", "Product support"],
  },
  {
    name: "Startup",
    price: 39,
    features: ["2 users", "Plan features", "Product support"],
  },
  {
    name: "Team",
    price: 89,
    features: ["5 users", "Plan features", "Product support"],
  },
  {
    name: "Enterprise",
    price: 149,
    features: ["10 users", "Plan features", "Product support"],
  },
];

export const faqs: FaqType[] = [
  {
    question: "How does the AI essay generator work?",
    answer:
      "You start by entering a title. The AI then suggests keywords, generates logical arguments, finds relevant examples, and produces conclusions and summaries — step by step.",
  },
  {
    question: "Can I customize or edit the generated content?",
    answer:
      "Yes. Everything generated is editable. You can refine, rewrite, or expand any part to suit your needs.",
  },
  {
    question: "Will my writing be flagged as AI-generated?",
    answer:
      "No. Our AI is designed to rewrite and structure content in a human-like way, minimizing detection by AI-content detectors.",
  },
  {
    question: "How does the platform avoid AI-detection systems?",
    answer:
      "We use advanced rewriting and paraphrasing techniques that mimic natural human writing, reducing the risk of detection.",
  },
  {
    question: "Do you use my content for AI training?",
    answer:
      "Never. Your data is not used for training, marketing, or any other secondary purposes.",
  },
  {
    question: "Is the content I generate private and secure?",
    answer:
      "Yes. Everything is processed in real time and kept confidential. No data is shared or saved.",
  },
  {
    question: "Is it safe to use this for academic assignments?",
    answer:
      "Our tool is designed to assist in content planning and idea development. You should always follow your institution's academic policies.",
  },
  {
    question: "Is this tool meant to replace writing myself?",
    answer:
      "No. It's a tool to assist and accelerate your writing, not a substitute for your own thinking or voice.",
  },
  {
    question: "Who can I contact if I need help?",
    answer:
      "You can reach us anytime at [support@tudorai.com.au] or via the help button in the app.",
  },
];
