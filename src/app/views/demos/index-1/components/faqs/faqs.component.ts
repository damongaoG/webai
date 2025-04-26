import { splitArray } from '@/app/helper/utils'
import { Component } from '@angular/core'
import { faqData } from '../data'
import { LucideAngularModule } from 'lucide-angular'

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './faqs.component.html',
  styles: ``,
})
export class FaqsComponent {
  faqChunks = splitArray(faqData, 3)
}
