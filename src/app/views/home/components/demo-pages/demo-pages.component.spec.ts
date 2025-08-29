import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DemoPagesComponent } from "./demo-pages.component";

describe("DemoPagesComponent", () => {
  let component: DemoPagesComponent;
  let fixture: ComponentFixture<DemoPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DemoPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
