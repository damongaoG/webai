import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { postGeneratorFeatures } from '../data'

@Component({
  selector: 'post-generator',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './generator.component.html',
  styles: ``,
})
export class GeneratorComponent {
  postGeneratorFeatures = postGeneratorFeatures
}
