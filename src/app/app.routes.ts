import { Routes } from '@angular/router'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from './services/auth.service'

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
        const authService = inject(AuthService)
        if (!authService.isAuthenticated()) {
          return router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: url._routerState.url },
          })
        }
        return true
      },
    ],
  },
  {
    path: "auth",
    children: [
      {
        path: "login",
        loadComponent: () =>
          import("./pages/auth/login/login.component").then(
            (m) => m.LoginComponent
          ),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
