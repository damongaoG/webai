import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'

type FeatureType = {
  name: string
  icon: string
}

@Component({
  selector: 'home-features',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './features.component.html',
  styles: ``,
})
export class FeaturesComponent {
  features: FeatureType[] = [
    {
      name: 'Fully Responsive',
      icon: 'tablet-smartphone',
    },
    {
      name: 'Cross-browser compatible',
      icon: 'chrome',
    },
    {
      name: 'Easy to customize',
      icon: 'cog',
    },
    {
      name: 'Developer Friendly',
      icon: 'cpu',
    },
    {
      name: 'Clean & Easy to Understand Code',
      icon: 'code-xml',
    },
    {
      name: 'Font and SVG Icons',
      icon: 'dribbble',
    },
    {
      name: 'Free Updates',
      icon: 'check-check',
    },
    {
      name: 'Ultimate Support',
      icon: 'badge-help',
    },
  ]
}
