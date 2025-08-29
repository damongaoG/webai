import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

type pageType = {
  name: string;
  url: string;
  image: string;
};

@Component({
  selector: "demo-pages",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./demo-pages.component.html",
  styles: ``,
})
export class DemoPagesComponent {
  demoPages: pageType[] = [
    {
      name: "Web 3",
      url: "/pages/index-1",
      image: "assets/images/demo/demo1.png",
    },
    {
      name: "Image Generator",
      url: "/pages/index-2",
      image: "assets/images/demo/demo2.png",
    },
    {
      name: "Video Creator",
      url: "/pages/index-3",
      image: "assets/images/demo/demo3.png",
    },
    {
      name: "Content Creator",
      url: "/pages/index-4",
      image: "assets/images/demo/demo4.png",
    },
    {
      name: "Business Tools",
      url: "/pages/index-5",
      image: "assets/images/demo/demo5.png",
    },
  ];
}
