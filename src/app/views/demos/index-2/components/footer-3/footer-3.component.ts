import { Component } from '@angular/core'
import { credits, currentYear } from '@common/constants'
import { LucideAngularModule } from 'lucide-angular'

@Component({
  selector: 'footer-3',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './footer-3.component.html',
  styles: ``,
})
export class Footer3Component {
  currentYear = currentYear
  developedBy = credits.name

  socialIcons = ['facebook', 'instagram', 'twitter', 'linkedin']
}
