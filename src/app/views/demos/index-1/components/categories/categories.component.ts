import { Component, type OnDestroy, type OnInit } from "@angular/core";
import { categories } from "../data";
import { LucideAngularModule } from "lucide-angular";
import { interval, type Subscription } from "rxjs";
import { calculateTimeToEvent } from "@/app/helper/utils";

@Component({
  selector: "app-categories",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./categories.component.html",
  styles: ``,
})
export class CategoriesComponent implements OnInit, OnDestroy {
  trendingCategories = categories;

  days?: number;
  _hours?: number;
  _minutes?: number;
  _seconds?: number;
  countdown: { days: number; hours: number; minutes: number; seconds: number } =
    {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  private intervalSubscription!: Subscription;

  ngOnInit(): void {
    this.countdown = calculateTimeToEvent();
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.countdown = calculateTimeToEvent();
    });
  }

  ngOnDestroy(): void {
    this.intervalSubscription.unsubscribe();
  }
}
