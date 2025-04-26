import { Component } from '@angular/core'
import { LightgalleryModule } from 'lightgallery/angular'
import { LucideAngularModule } from 'lucide-angular'
import lgVideo from 'lightgallery/plugins/video'

@Component({
  selector: 'hero-5',
  standalone: true,
  imports: [LucideAngularModule, LightgalleryModule],
  templateUrl: './hero.component.html',
  styles: ``,
})
export class HeroComponent {
  isModalOpen = false

  settings = {
    counter: false,
    selector: 'a',
    plugins: [lgVideo],
    download: false,
  }

  openModal() {
    this.isModalOpen = true
    setTimeout(() => {
      const modal = document.getElementById('watchvideomodal')

      if (modal) {
        modal.classList.remove('hidden')
      }
    }, 0)
  }

  closeModal(event: MouseEvent) {
    const target = event.target as HTMLElement

    // Close modal if the clicked target is the modal overlay
    if (target.id === 'watchvideomodal') {
      this.isModalOpen = false
      const modal = document.getElementById('watchvideomodal')
      if (modal) {
        modal.classList.add('hidden')
      }
    }
  }
}
