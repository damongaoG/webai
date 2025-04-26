import { Component } from '@angular/core'
import { pricingPlans } from '../data'
import { LucideAngularModule } from 'lucide-angular'
import { currency } from '@common/constants'

@Component({
  selector: 'pricing',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './pricing.component.html',
  styles: ``,
})
export class PricingComponent {
  pricingPlans = pricingPlans
  currency = currency
}
