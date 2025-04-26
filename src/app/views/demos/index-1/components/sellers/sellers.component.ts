import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { sellersData } from '../data'
import { currency } from '@common/constants'

@Component({
  selector: 'app-sellers',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './sellers.component.html',
  styles: ``,
})
export class SellersComponent {
  sellers = sellersData
  currency = currency
}
