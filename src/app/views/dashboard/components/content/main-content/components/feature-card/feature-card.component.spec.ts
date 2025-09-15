import { TestBed } from "@angular/core/testing";
import { FeatureCardComponent } from "./feature-card.component";
import { EssayService } from "@/app/services/essay.service";
import { EssayStateService } from "@/app/services/essay-state.service";
import { TaskSelectionService } from "@/app/services/task-selection.service";
import { ToastService } from "@/app/shared";
import { DashboardSharedService } from "../../../dashboard-shared.service";
import { Observable, Subscription } from "rxjs";

class EssayServiceStub {
  lastUnsubscribeSpy?: jasmine.Spy;
  lastCalledWithId: string | null = null;

  streamModelCases(essayId: string): Observable<any> {
    this.lastCalledWithId = essayId;
    this.lastUnsubscribeSpy = jasmine.createSpy("unsubscribeSpy");
    return new Observable<any>(() => {
      return {
        unsubscribe: this.lastUnsubscribeSpy!,
      } as unknown as Subscription;
    });
  }
}

class EssayStateServiceStub {
  private _essayId: string | null = "abc";
  private _allowed = true;
  essayId() {
    return this._essayId;
  }
  setEssayId(id: string | null) {
    this._essayId = id;
  }
  isInteractionAllowed(contentType: string): boolean {
    if (contentType === "casestudies") return this._allowed;
    return true;
  }
  setAllowed(v: boolean) {
    this._allowed = v;
  }
  isArgumentsLoading() {
    return false as const;
  }
  isScholarsLoading() {
    return false as const;
  }
}

class TaskSelectionServiceStub {
  selectTask = jasmine.createSpy("selectTask");
}

class ToastServiceStub {
  error = jasmine.createSpy("error");
}

class DashboardSharedServiceStub {
  selectTask = jasmine.createSpy("selectTask");
}

describe("FeatureCardComponent casestudies streaming", () => {
  let component: FeatureCardComponent;
  let essayServiceStub: EssayServiceStub;
  let essayStateStub: EssayStateServiceStub;
  let toastStub: ToastServiceStub;

  beforeEach(() => {
    essayServiceStub = new EssayServiceStub();
    essayStateStub = new EssayStateServiceStub();
    toastStub = new ToastServiceStub();

    TestBed.configureTestingModule({
      imports: [FeatureCardComponent],
      providers: [
        { provide: EssayService, useValue: essayServiceStub },
        { provide: EssayStateService, useValue: essayStateStub },
        { provide: TaskSelectionService, useClass: TaskSelectionServiceStub },
        { provide: ToastService, useValue: toastStub },
        {
          provide: DashboardSharedService,
          useClass: DashboardSharedServiceStub,
        },
      ],
    });
    const fixture = TestBed.createComponent(FeatureCardComponent);
    component = fixture.componentInstance;
    component.featureCard = {
      id: "casestudies",
      title: "Case studies",
      iconPath: "",
      iconAlt: "",
    } as any;
    component.cardState = {
      expandable: { isExpanded: false, contentType: "casestudies" },
      showGradient: false,
      isPersistent: false,
    } as any;
  });

  it("calls streamModelCases when expanding casestudies with essayId", () => {
    essayStateStub.setEssayId("essay-123");
    essayStateStub.setAllowed(true);

    component.onExpandClick();

    expect(essayServiceStub.lastCalledWithId).toBe("essay-123");
    expect(essayServiceStub.lastUnsubscribeSpy).toBeDefined();
  });

  it("shows error and does not call streamModelCases when essayId missing", () => {
    essayStateStub.setEssayId(null);
    essayStateStub.setAllowed(true);

    component.onExpandClick();

    expect(essayServiceStub.lastCalledWithId).toBeNull();
    expect(toastStub.error).toHaveBeenCalled();
  });

  it("unsubscribes stream when collapsing casestudies", () => {
    essayStateStub.setEssayId("essay-xyz");
    essayStateStub.setAllowed(true);

    // First click: expand => subscribe
    component.onExpandClick();
    const unsubscribeSpy = essayServiceStub.lastUnsubscribeSpy!;
    expect(unsubscribeSpy).toBeDefined();
    expect(unsubscribeSpy).not.toHaveBeenCalled();

    // Simulate that content is currently expanded so next click collapses
    (component.cardState as any).expandable.isExpanded = true;

    // Second click: collapse => unsubscribe
    component.onExpandClick();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it("unsubscribes stream on component destroy", () => {
    essayStateStub.setEssayId("essay-destroy");
    essayStateStub.setAllowed(true);

    const fixture = TestBed.createComponent(FeatureCardComponent);
    const cmp = fixture.componentInstance;
    cmp.featureCard = {
      id: "casestudies",
      title: "Case studies",
      iconPath: "",
      iconAlt: "",
    } as any;
    cmp.cardState = {
      expandable: { isExpanded: false, contentType: "casestudies" },
      showGradient: false,
      isPersistent: false,
    } as any;

    cmp.onExpandClick();
    const unsubscribeSpy = (
      TestBed.inject(EssayService) as any as EssayServiceStub
    ).lastUnsubscribeSpy!;
    expect(unsubscribeSpy).toBeDefined();
    expect(unsubscribeSpy).not.toHaveBeenCalled();

    fixture.destroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
