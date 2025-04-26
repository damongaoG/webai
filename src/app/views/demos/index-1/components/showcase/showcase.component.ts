import { Component } from '@angular/core'
import { LucideAngularModule } from 'lucide-angular'
import { LightgalleryModule } from 'lightgallery/angular'
import { browseByCategoryData } from '../data'

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [LucideAngularModule, LightgalleryModule],
  templateUrl: './showcase.component.html',
  styles: ``,
})
export class ShowcaseComponent {
  browseByCategories = browseByCategoryData
  showcaseImages = [
    'assets/images/nft/art/10.png',
    'assets/images/nft/art/4.png',
    'assets/images/nft/art/5.png',
    'assets/images/nft/art/9.png',
    'assets/images/nft/art/14.png',
    'assets/images/nft/art/22.png',
    'assets/images/nft/art/25.png',
    'assets/images/nft/art/20.png',
  ]
  settings = {
    counter: false,
    selector: 'a',
    download: false,
  }
}
