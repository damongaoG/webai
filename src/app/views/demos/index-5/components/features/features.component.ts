import { splitArray } from '@/app/helper/utils'
import { Component } from '@angular/core'
import { features } from '../data'
import { LucideAngularModule } from 'lucide-angular'

@Component({
  selector: 'ai-tools-features',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './features.component.html',
  styles: ``,
})
export class FeaturesComponent {
  featureChunks = splitArray(features, 2)
}
