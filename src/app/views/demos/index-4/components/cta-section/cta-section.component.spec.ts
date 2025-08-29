import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CtaSectionComponent } from "./cta-section.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("CtaSectionComponent", () => {
  let component: CtaSectionComponent;
  let fixture: ComponentFixture<CtaSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtaSectionComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CtaSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render the main heading", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector("h2");
    expect(heading?.textContent).toContain(
      "Ready to write better, faster, and safer?",
    );
  });

  it("should render the subheading", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const subheading = compiled.querySelector("p");
    expect(subheading?.textContent).toContain(
      "Start your AI-powered writing journey today.",
    );
  });

  it("should have a Get Started button with correct route", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('a[routerLink="/auth/login"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain("Get Started");
  });
});
