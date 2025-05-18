import { Component, inject, Renderer2, type OnInit } from "@angular/core";
import {
  NavigationEnd,
  Router,
  RouterOutlet,
  type Event,
} from "@angular/router";
import * as AOS from "aos";
import { icons, LUCIDE_ICONS, LucideIconProvider } from "lucide-angular";
import { IStaticMethods } from "preline/preline";
import { BackToTopComponent } from "@components/back-to-top.component";
import { TitleService } from "./services/title.service";
import { AuthService } from "./services/auth.service";
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}
@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, BackToTopComponent],
  providers: [
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider(icons),
    },
  ],
  templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
  private titleService = inject(TitleService);
  private authService = inject(AuthService);
  private renderer = inject(Renderer2);
  constructor(private router: Router) {}

  ngOnInit() {
    this.titleService.init();
    // Check authentication status
    this.checkAuthStatus();

    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          window.HSStaticMethods.autoInit();
        }, 100);
      }
    });

    AOS.init();
    this.renderer.addClass(document.body, "bg-default-900");
  }

  private checkAuthStatus() {
    this.authService.reLogIn().subscribe({
      next: (result) => {
        // Redirect to dashboard
        if (result.code === 1 && this.router.url.startsWith("/auth")) {
          this.router.navigate(["/dashboard"]);
        }
      },
      error: () => {
        console.error("An error occurred on re-login");
      },
    });
  }

  ngOnDestroy() {
    this.renderer.removeClass(document.body, "bg-default-900");
  }
}
