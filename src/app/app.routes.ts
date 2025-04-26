import { inject } from '@angular/core'
import { Router, Routes } from '@angular/router'
import { AuthenticationService } from '@/app/services/auth.service'
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout.component'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./views/home/home.component').then((mod) => mod.HomeComponent),
    data: {
      title: 'WebAI- AI Startup & Technology Landing Page Angular Template',
    },
  },
  {
    path: 'pages',
    loadChildren: () =>
      import('./views/demos/demos.route').then((mod) => mod.DEMO_PAGES_ROUTES),
    canActivate: [
      (url: any) => {
        const router = inject(Router)
        const authService = inject(AuthenticationService)
        if (!authService.session) {
          return router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: url._routerState.url },
          })
        }
        return true
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./views/auth/auth.route').then((mod) => mod.AUTH_PAGES_ROUTES),
  },
]
