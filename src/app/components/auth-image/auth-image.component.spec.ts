import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AuthImageComponent } from "./auth-image.component";

describe("AuthImageComponent", () => {
  let component: AuthImageComponent;
  let fixture: ComponentFixture<AuthImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
