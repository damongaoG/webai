import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { ServerErrorComponent } from "./pages/error/server-error.component";
import { ForgetPasswordComponent } from "./views/auth/forget-password/forget-password.component";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./views/home/home.component").then((mod) => mod.HomeComponent),
    data: {
      title: "WebAI- AI Startup & Technology Landing Page Angular Template",
    },
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./views/dashboard/dashboard.component").then(
        (mod) => mod.DashboardComponent,
      ),
    canActivate: [authGuard],
    data: { title: "Dashboard" },
  },
  {
    path: "forget-password",
    component: ForgetPasswordComponent,
    data: { title: "Forget Password" },
  },
  {
    path: "pages",
    loadChildren: () =>
      import("./views/demos/demos.route").then((mod) => mod.DEMO_PAGES_ROUTES),
    canActivate: [authGuard],
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./views/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "server-error",
    component: ServerErrorComponent,
  },
  {
    path: "**",
    redirectTo: "",
  },
];
