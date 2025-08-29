import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PostGeneratorComponent } from "./post-generator.component";

describe("PostGeneratorComponent", () => {
  let component: PostGeneratorComponent;
  let fixture: ComponentFixture<PostGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostGeneratorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
