import { Routes } from "@angular/router";
import { authGuard } from "./guards/auth.guard";
import { ServerErrorComponent } from "./pages/error/server-error.component";
import { ForgetPasswordComponent } from "./views/auth/forget-password/forget-password.component";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./views/demos/index-4/index-4.component").then(
        (mod) => mod.Index4Component,
      ),
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
    path: "essay-model",
    loadComponent: () =>
      import("./views/dashboard/essay-model/essay-model.component").then(
        (mod) => mod.EssayModelComponent,
      ),
    canActivate: [authGuard],
    data: { title: "Essay Model" },
  },
  {
    path: "rewrite",
    loadComponent: () =>
      import("./components/rewrite-model/rewrite-model.component").then(
        (mod) => mod.RewriteModelComponent,
      ),
    canActivate: [authGuard],
    data: { title: "Rewrite Model" },
    children: [
      {
        path: "",
        loadComponent: () =>
          import(
            "./components/rewrite-model/components/chat-bot/chat-bot.component"
          ).then((mod) => mod.ChatBotComponent),
      },
    ],
  },
  {
    path: "profile",
    canActivate: [authGuard],
    children: [
      {
        path: "change-password",
        loadComponent: () =>
          import(
            "./views/profile/change-password/change-password.component"
          ).then((mod) => mod.ChangePasswordComponent),
        data: { title: "Change password" },
      },
      {
        path: "activation-code",
        loadComponent: () =>
          import(
            "./views/profile/activation-code/activation-code.component"
          ).then((mod) => mod.ActivationCodeComponent),
        data: { title: "Activation Code" },
      },
    ],
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
