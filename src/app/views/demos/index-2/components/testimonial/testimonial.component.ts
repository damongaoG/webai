import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { testimonialData } from '../data'
import { SwiperDirective } from '@components/swiper-directive.component'
import type { SwiperOptions } from 'swiper/types'
import { register } from 'swiper/element'
import { Pagination } from 'swiper/modules'
import { LucideAngularModule } from 'lucide-angular'

register()

@Component({
  selector: 'testimonial',
  standalone: true,
  imports: [SwiperDirective, LucideAngularModule],
  templateUrl: './testimonial.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TestimonialComponent {
  testimonials = testimonialData

  swiperConfig: SwiperOptions = {
    loop: true,
    modules: [Pagination],
    autoplay: {
      delay: 2500,
      disableOnInteraction: false,
    },
    pagination: {
      clickable: true,
      el: '.swiper-pagination',
    },
  }
}
