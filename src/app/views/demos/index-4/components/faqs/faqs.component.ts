import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { faqs } from '../data'

@Component({
  selector: 'content-faqs',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './faqs.component.html',
  styles: ``,
})
export class FaqsComponent {
  faqsData = faqs
}
