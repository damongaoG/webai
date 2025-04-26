import { Component } from '@angular/core'
import { FooterComponent } from '@components/footer/footer.component'
import { footerLinks } from '../data'
import { LucideAngularModule } from 'lucide-angular'

@Component({
  selector: 'footer-6',
  standalone: true,
  imports: [FooterComponent, LucideAngularModule],
  templateUrl: './footer-6.component.html',
  styles: ``,
})
export class Footer6Component {
  footerLinks = footerLinks
  socialIcons = ['facebook', 'instagram', 'twitter', 'linkedin']
}
