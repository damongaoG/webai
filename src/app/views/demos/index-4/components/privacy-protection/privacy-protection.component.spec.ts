import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PrivacyProtectionComponent } from "./privacy-protection.component";

describe("PrivacyProtectionComponent", () => {
  let component: PrivacyProtectionComponent;
  let fixture: ComponentFixture<PrivacyProtectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyProtectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyProtectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have three privacy features", () => {
    expect(component["privacyFeatures"].length).toBe(3);
  });

  it("should render all privacy features", () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureElements = compiled.querySelectorAll(".group");
    expect(featureElements.length).toBe(3);
  });
});
