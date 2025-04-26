import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { FakeBackendProvider } from './helper/fake-backend'
import { provideEffects } from '@ngrx/effects'
import { AuthenticationEffects } from '@store/authentication/authentication.effects'
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http'
import { BrowserModule } from '@angular/platform-browser'
import { provideStore } from '@ngrx/store'
import { rootReducer } from './store'
import { NzMessageModule } from 'ng-zorro-antd/message'

export const appConfig: ApplicationConfig = {
  providers: [
    FakeBackendProvider,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(rootReducer),
    provideEffects(AuthenticationEffects),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    importProvidersFrom(
      BrowserModule,
      NzMessageModule
    ),
  ],
}
