export type PostGeneratorType = {
  title: string
  icon: string
  description: string
}

export type PricingType = {
  name: string
  price: number
  features: string[]
  isPopular?: boolean
}

export type FaqType = {
  id: number
  question: string
  answer: string
}
