import { Component } from '@angular/core'
import { TopNavbarComponent } from '../../components/top-navbar/top-navbar.component'
import { HeroComponent } from './components/hero/hero.component'
import { DemoPagesComponent } from './components/demo-pages/demo-pages.component'
import { AccountPagesComponent } from './components/account-pages/account-pages.component'
import { FeaturesComponent } from './components/features/features.component'
import { FooterComponent } from './components/footer/footer.component'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TopNavbarComponent,
    HeroComponent,
    DemoPagesComponent,
    AccountPagesComponent,
    FeaturesComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styles: ``,
})
export class HomeComponent {
  navLinks = [
    { label: 'Home', link: '#home' },
    { label: 'Demo', link: '#demo' },
    { label: 'Features', link: '#features' },
  ]
}
