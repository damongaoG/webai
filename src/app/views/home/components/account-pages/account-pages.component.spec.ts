import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AccountPagesComponent } from "./account-pages.component";

describe("AccountPagesComponent", () => {
  let component: AccountPagesComponent;
  let fixture: ComponentFixture<AccountPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountPagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
