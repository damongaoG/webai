import type { FooterLinkType } from '@/app/types'
import type { FaqType, PostGeneratorType, PricingType } from './types'

export const postGeneratorFeatures: PostGeneratorType[] = [
  {
    icon: 'chart-line',
    title: 'Grow on multiple platforms',
    description:
      'By utilizing the artificial intelligence AI technology that we provide, you can quickly grow on various platforms without having to invest extra time and effort.',
  },
  {
    icon: 'smartphone',
    title: 'Engage viewers everywhere',
    description:
      'By adopting advanced AI technology, you can expand the reach of your audience and reach viewers on various platforms in an effective and efficient way.',
  },
  {
    icon: 'shopping-cart',
    title: 'Spend more time creating',
    description:
      'With the artificial intelligence AI technology that we provide, you can produce spectacular video edits in a very short time effective and efficient way.',
  },
]

export const pricingPlans: PricingType[] = [
  {
    name: 'Basic plan',
    price: 12,
    features: [
      'All analytics features',
      'Up to 25,000 tracked visits',
      'Normal support',
      'Mobile app',
      'Up to 3 team members',
    ],
  },
  {
    name: 'Startup',
    price: 35,
    features: [
      'Everything on Basic plan',
      'Up to 1,000 tracked visits',
      'Premium support',
      'Mobile app',
      'Up to 10 team members',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 60,
    features: [
      'Everything on Growth plan',
      'Up to 5,000 tracked visits',
      'Dedicated support',
      'Mobile app',
      'Up to 50 team members',
    ],
  },
]

export const faqs: FaqType[] = [
  {
    id: 1,
    question: 'Will you support my language?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
  {
    id: 2,
    question: 'Do you also provide subtitles?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
  {
    id: 3,
    question: 'How do I get started?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
  {
    id: 4,
    question: 'Do you have any samples?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
  {
    id: 5,
    question: 'Can I get custom templates?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
  {
    id: 6,
    question: 'What types of videos can I upload?',
    answer:
      'You can upload any files from your computer or use Youtube links. Keep in mind that our content repurposing works best with longer videos.',
  },
]

export const footerLinks: FooterLinkType[] = [
  {
    title: 'Product',
    links: [
      { name: 'Features' },
      { name: 'Get an Essay' },
      { name: 'Pricing' },
    ],
  },
  {
    title: 'Support',
    links: [{ name: 'Walkthrough' }, { name: 'Blog' }, { name: 'Contact' }],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Terms of service' },
      { name: 'Refund policy' },
      { name: 'Privacy policy' },
    ],
  },
]
