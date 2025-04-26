import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { SwiperDirective } from '@components/swiper-directive.component'
import type { SwiperOptions } from 'swiper/types'
import { register } from 'swiper/element'

register()

@Component({
  selector: 'hero-swiper',
  standalone: true,
  imports: [SwiperDirective],
  templateUrl: './hero-swiper.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HeroSwiperComponent {
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 30,
    centeredSlides: true,
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    breakpoints: {
      400: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 40,
      },
      1024: {
        slidesPerView: 4,
        spaceBetween: 50,
      },
    },
  }
}
