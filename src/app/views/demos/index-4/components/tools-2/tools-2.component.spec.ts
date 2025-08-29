import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Tools2Component } from "./tools-2.component";

describe("Tools2Component", () => {
  let component: Tools2Component;
  let fixture: ComponentFixture<Tools2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tools2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Tools2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
