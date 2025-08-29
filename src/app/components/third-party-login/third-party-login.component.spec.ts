import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ThirdPartyLoginComponent } from "./third-party-login.component";

describe("ThirdPartyLoginComponent", () => {
  let component: ThirdPartyLoginComponent;
  let fixture: ComponentFixture<ThirdPartyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThirdPartyLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdPartyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
