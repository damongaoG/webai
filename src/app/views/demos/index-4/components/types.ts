export type ToolType = {
  icon: string
  title: string
  description: string
}

export type FeatureType = {
  icon: string
  name: string
  description: string
}

export type TopicType = {
  id: number
  title: string
  description: string
  avatars: string[]
}

export type TestimonialType = {
  name: string
  avatar: string
  description: string
}

export type PricingType = {
  name: string
  price: number
  features: string[]
}

export type FaqType = {
  question: string
  answer: string
}
