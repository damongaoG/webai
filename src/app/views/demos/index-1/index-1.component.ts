import { Component } from "@angular/core";
import { TopNavbarComponent } from "../../../components/top-navbar/top-navbar.component";
import { HeroComponent } from "./components/hero/hero.component";
import { CategoriesComponent } from "./components/categories/categories.component";
import { SellersComponent } from "./components/sellers/sellers.component";
import { ShowcaseComponent } from "./components/showcase/showcase.component";
import { FaqsComponent } from "./components/faqs/faqs.component";
import { BlogsComponent } from "./components/blogs/blogs.component";
import { FooterComponent } from "./components/footer/footer.component";

@Component({
  selector: "app-index-1",
  standalone: true,
  imports: [
    TopNavbarComponent,
    HeroComponent,
    CategoriesComponent,
    SellersComponent,
    ShowcaseComponent,
    FaqsComponent,
    BlogsComponent,
    FooterComponent,
  ],
  templateUrl: "./index-1.component.html",
  styles: ``,
})
export class Index1Component {
  navLinks = [
    {
      label: "Home",
      link: "#home",
    },
    {
      label: "Categories",
      link: "#categories",
    },
    {
      label: "Sellers",
      link: "#sellers",
    },
    {
      label: "Showcase",
      link: "#showcase",
    },
    {
      label: "Faq",
      link: "#faq",
    },
    {
      label: "Blog",
      link: "#blog",
    },
  ];
}
