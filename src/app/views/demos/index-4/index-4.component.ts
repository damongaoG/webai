import { Component } from '@angular/core'
import { TopNavbarComponent } from '@components/top-navbar/top-navbar.component'
import { HeroComponent } from './components/hero/hero.component'
import { ToolsComponent } from './components/tools/tools.component'
import { Tools2Component } from './components/tools-2/tools-2.component'
import { FeaturesComponent } from './components/features/features.component'
import { TrendingTopicsComponent } from './components/trending-topics/trending-topics.component'
import { TestimonialsComponent } from './components/testimonials/testimonials.component'
import { PricingPlansComponent } from './components/pricing-plans/pricing-plans.component'
import { FaqsComponent } from './components/faqs/faqs.component'
import { Footer5Component } from './components/footer/footer.component'

@Component({
  selector: 'app-index-4',
  standalone: true,
  imports: [
    TopNavbarComponent,
    HeroComponent,
    ToolsComponent,
    Tools2Component,
    FeaturesComponent,
    TrendingTopicsComponent,
    TestimonialsComponent,
    PricingPlansComponent,
    FaqsComponent,
    Footer5Component,
  ],
  templateUrl: './index-4.component.html',
  styles: ``,
})
export class Index4Component {
  navLinks = [
    {
      label: 'Home',
      link: '#home',
    },
    {
      label: 'Tools',
      link: '#tools',
    },
    {
      label: 'Features',
      link: '#features',
    },
    {
      label: 'Testimonials',
      link: '#testimonials',
    },
    {
      label: 'Price',
      link: '#price',
    },
    {
      label: 'Faq',
      link: '#faq',
    },
  ]
}
