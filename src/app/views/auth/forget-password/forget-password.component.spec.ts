import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ForgetPasswordComponent } from "./forget-password.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { AuthService } from "@/app/services/auth.service";
import { NzMessageService } from "ng-zorro-antd/message";
import { CommonModule } from "@angular/common";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe("ForgetPasswordComponent", () => {
  let component: ForgetPasswordComponent;
  let fixture: ComponentFixture<ForgetPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let messageSpy: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj("AuthService", [
      "validateForgetPassword",
    ]);
    messageSpy = jasmine.createSpyObj("NzMessageService", ["success", "error"]);

    await TestBed.configureTestingModule({
      imports: [
        ForgetPasswordComponent,
        RouterTestingModule,
        ReactiveFormsModule,
        CommonModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => {
                  if (key === "source") return "test@example.com";
                  if (key === "key") return "12345";
                  return null;
                },
              },
            },
          },
        },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NzMessageService, useValue: messageSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should validate form fields", () => {
    // Form should be invalid initially
    expect(component.resetForm.valid).toBeFalsy();

    // Set valid values
    component.resetForm.get("password")?.setValue("password123");
    component.resetForm.get("confirmPassword")?.setValue("password123");

    expect(component.resetForm.valid).toBeTruthy();
  });

  it("should detect password mismatch", () => {
    component.resetForm.get("password")?.setValue("password123");
    component.resetForm.get("confirmPassword")?.setValue("different");

    expect(component.resetForm.hasError("passwordMismatch")).toBeTruthy();
  });
});
