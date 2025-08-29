import { CommonModule } from "@angular/common";
import {
  Component,
  HostListener,
  Input,
  ViewChild,
  type AfterViewInit,
  type ElementRef,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import Gumshoe from "gumshoejs";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-top-navbar",
  standalone: true,
  imports: [RouterLink, CommonModule, LucideAngularModule],
  templateUrl: "./top-navbar.component.html",
  styles: ``,
})
export class TopNavbarComponent implements AfterViewInit {
  navSticky = false;

  @Input() linkList: { label: string; link: string }[] | undefined;

  ngAfterViewInit() {
    if (document.querySelector(".navbar-nav a"))
      new Gumshoe(".navbar-nav a", { offset: 80 });
  }

  scrollToSection(event: Event, link: string) {
    event.preventDefault();
    const targetId = link.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  @ViewChild("homenavbar") navbarRef!: ElementRef;

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    if (this.navbarRef) {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY >= 50) {
        this.navSticky = true;
      } else {
        this.navSticky = false;
      }
    }
  }
}
