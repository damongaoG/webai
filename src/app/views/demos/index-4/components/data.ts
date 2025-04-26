import type {
  FaqType,
  FeatureType,
  PricingType,
  TestimonialType,
  ToolType,
  TopicType,
} from './types'

export const aiTools: ToolType[] = [
  {
    icon: 'dribbble',
    title: 'Latest AI technology',
    description:
      'Click on Chat Archive and search to Watch Ask Anything Chats from your favocite artists. Ask Them A Question.',
  },
  {
    icon: 'messages-square',
    title: 'Muiti-language',
    description:
      'Click on Chat Archive and search to Watch Ask Anything Chats from your favocite artists. Ask Them A Question.',
  },
  {
    icon: 'image',
    title: 'Edit text easily',
    description:
      'Click on Chat Archive and search to Watch Ask Anything Chats from your favocite artists. Ask Them A Question.',
  },
]

export const features: FeatureType[] = [
  {
    icon: 'send',
    name: 'Blog Post',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
  {
    icon: 'youtube',
    name: 'Social Media',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
  {
    icon: 'facebook',
    name: 'Blog Post',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
  {
    icon: 'mail',
    name: 'Email',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
  {
    icon: 'user',
    name: 'FAQ',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
  {
    icon: 'star',
    name: 'Testimonials',
    description:
      'Generate blog posts on a variety of topics, from industry news and trends to product reviews and how-to guides.',
  },
]

export const trendingTopics: TopicType[] = [
  {
    id: 1,
    title: 'Wax layer',
    description: 'Pressure clean, sponge art, string art, army',
    avatars: [
      'assets/images/avatars/img-2.png',
      'assets/images/avatars/img-1.png',
      'assets/images/avatars/img-3.png',
    ],
  },
  {
    id: 2,
    title: 'Crowd Defence',
    description: 'attack other gang, big, army, Crowd evolution',
    avatars: [
      'assets/images/avatars/img-4.png',
      'assets/images/avatars/img-5.png',
    ],
  },
  {
    id: 3,
    title: 'Spinner blade',
    description: 'beyblade games, fidget spinner, spinner battle',
    avatars: [
      'assets/images/avatars/img-6.png',
      'assets/images/avatars/img-7.png',
      'assets/images/avatars/img-8.png',
      'assets/images/avatars/img-5.png',
    ],
  },
  {
    id: 4,
    title: 'Restaurant game',
    description: 'Cooking madness, cooking, cafe, new hotel',
    avatars: [
      'assets/images/avatars/img-8.png',
      'assets/images/avatars/img-4.png',
      'assets/images/avatars/img-6.png',
    ],
  },
  {
    id: 5,
    title: 'entire marvel universe',
    description: 'Marvel, mutant ninja turtles, super heroes',
    avatars: ['assets/images/avatars/img-1.png'],
  },
  {
    id: 6,
    title: 'Draw bridge',
    description: 'road draw, draw rider, build bridge , build',
    avatars: [
      'assets/images/avatars/img-2.png',
      'assets/images/avatars/img-6.png',
      'assets/images/avatars/img-3.png',
    ],
  },
]

export const userTestimonialData: TestimonialType[] = [
  {
    name: 'Ryan Delk',
    avatar: 'assets/images/avatars/img-1.png',
    description:
      "I've tried other AI writing tools before, but this one is by far the best. The language is sophisticated and engaging, and it's helped me take my content to the next level.",
  },
  {
    name: 'Marsel Fischer',
    avatar: 'assets/images/avatars/img-2.png',
    description:
      "As a content marketer, I'm always looking for ways to streamline my workflow and create high-quality content. I don't know how I ever managed without it.",
  },
  {
    name: 'John Tayes',
    avatar: 'assets/images/avatars/img-3.png',
    description:
      'The solutions offered by your AI chatbots are truly impressive! We are able to communicate with our customers faster and more interactively.',
  },
  {
    name: 'Ryan Jonas',
    avatar: 'assets/images/avatars/img-4.png',
    description:
      "I've tried other AI writing tools before, but this one is by far the best. The language is sophisticated and engaging, and it's helped me take my content to the next level.",
  },
  {
    name: 'Randy Hilarski',
    avatar: 'assets/images/avatars/img-5.png',
    description:
      'I was surprised by the ease and speed of the video editing service based on AI technology from this site. The results are amazing and very satisfying.',
  },
  {
    name: 'Jonathan Simcoe',
    avatar: 'assets/images/avatars/img-6.png',
    description:
      'The solutions offered by your AI chatbots are truly impressive! We are able to communicate with our customers faster and more interactively.',
  },
]

export const pricingPlans: PricingType[] = [
  {
    name: 'Free',
    price: 0,
    features: ['1 user', 'Plan features', 'Product support'],
  },
  {
    name: 'Startup',
    price: 39,
    features: ['2 users', 'Plan features', 'Product support'],
  },
  {
    name: 'Team',
    price: 89,
    features: ['5 users', 'Plan features', 'Product support'],
  },
  {
    name: 'Enterprise',
    price: 149,
    features: ['10 users', 'Plan features', 'Product support'],
  },
]

export const faqs: FaqType[] = [
  {
    question: 'How does AI-BOX generate content?',
    answer:
      'AI-BOX utilizes advanced algorithms and machine learning techniques to generate content based on user inputs and desired parameters, resulting in unique and customized AI-generated creations.',
  },
  {
    question: 'What types of content can AI-BOX create?',
    answer:
      'AI-BOX utilizes advanced algorithms and machine learning techniques to generate content based on user inputs and desired parameters, resulting in unique and customized AI-generated creations.',
  },
  {
    question: 'Can I customize the content generated by AI-BOX?',
    answer:
      'AI-BOX utilizes advanced algorithms and machine learning techniques to generate content based on user inputs and desired parameters, resulting in unique and customized AI-generated creations.',
  },
]
