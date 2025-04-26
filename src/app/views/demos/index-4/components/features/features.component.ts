import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { features } from '../data'

@Component({
  selector: 'ai-content-features',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './features.component.html',
  styles: ``,
})
export class FeaturesComponent {
  features = features
}
