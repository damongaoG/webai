import { Component } from '@angular/core'

@Component({
  selector: 'hero-4',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styles: ``,
})
export class HeroComponent {
  marqueeGroup1 = [
    'Automatic learning',
    'Describe your idea',
    'Select Templates',
    'Optimization',
  ]
  marqueeGroup2 = [
    'Innovation',
    'Generate Copy',
    'Advanced analytics',
    'Algorithm',
    'Text Editor',
  ]
}
