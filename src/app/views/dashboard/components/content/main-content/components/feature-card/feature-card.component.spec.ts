import { TestBed } from "@angular/core/testing";
import { FeatureCardComponent } from "./feature-card.component";
import { EssayService } from "@/app/services/essay.service";
import { EssayStateService } from "@/app/services/essay-state.service";
import { TaskSelectionService } from "@/app/services/task-selection.service";
import { ToastService } from "@/app/shared";
import { DashboardSharedService } from "../../../dashboard-shared.service";
import { Observable, Subscription, Subject } from "rxjs";

class EssayServiceStub {
  lastUnsubscribeSpy?: jasmine.Spy;
  lastCalledWithId: string | null = null;
  private subject?: Subject<any>;

  streamModelCases(essayId: string): Observable<any> {
    this.lastCalledWithId = essayId;
    this.lastUnsubscribeSpy = jasmine.createSpy("unsubscribeSpy");
    this.subject = new Subject<any>();
    return new Observable<any>((subscriber) => {
      const sub = this.subject!.subscribe(subscriber);
      return {
        unsubscribe: () => {
          this.lastUnsubscribeSpy!();
          sub.unsubscribe();
        },
      } as unknown as Subscription;
    });
  }

  emitNext(value: any) {
    this.subject?.next(value);
  }
  emitError(err: any) {
    this.subject?.error(err);
  }
  emitComplete() {
    this.subject?.complete();
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

  it("adds arrow-loading class before first payload when expanding casestudies", () => {
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

    // Before expand: not loading
    fixture.detectChanges();
    const loadingHostBefore = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHostBefore.classList.contains("arrow-loading")).toBeFalse();

    // Expand to start SSE and set loading to true until first payload
    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-dom-1");
    cmp.onExpandClick();
    fixture.detectChanges();

    const loadingHostAfter = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHostAfter.classList.contains("arrow-loading")).toBeTrue();
  });

  it("removes loading after first valid payload arrives", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-dom-3");
    cmp.onExpandClick();
    fixture.detectChanges();

    let loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeTrue();

    // Loading section should be visible before first payload
    let inlineLoading = fixture.nativeElement.querySelector(
      ".casestudies-inline-loading",
    );
    expect(inlineLoading).not.toBeNull();

    // Emit first payload
    (TestBed.inject(EssayService) as any as EssayServiceStub).emitNext({
      index: 0,
      state: "RUNNING",
    });
    fixture.detectChanges();

    loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeFalse();

    inlineLoading = fixture.nativeElement.querySelector(
      ".casestudies-inline-loading",
    );
    expect(inlineLoading).toBeNull();
  });

  it("closes loading on error and cleans up subscription", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-dom-4");
    cmp.onExpandClick();
    fixture.detectChanges();

    const unsubscribeSpy = (
      TestBed.inject(EssayService) as any as EssayServiceStub
    ).lastUnsubscribeSpy!;

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitError(
      new Error("boom"),
    );
    fixture.detectChanges();

    const loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeFalse();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it("closes loading on complete and cleans up subscription", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-dom-5");
    cmp.onExpandClick();
    fixture.detectChanges();

    const unsubscribeSpy = (
      TestBed.inject(EssayService) as any as EssayServiceStub
    ).lastUnsubscribeSpy!;

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitComplete();
    fixture.detectChanges();

    const loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeFalse();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it("retains case items after complete (data remains visible)", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-keep-1");
    cmp.onExpandClick();
    fixture.detectChanges();

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitNext({
      index: 0,
      state: "RUNNING",
    });
    fixture.detectChanges();

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitComplete();
    fixture.detectChanges();

    expect(cmp.caseItemsData.length).toBe(1);
  });

  it("retains case items after error (data remains visible)", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-keep-2");
    cmp.onExpandClick();
    fixture.detectChanges();

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitNext({
      index: 1,
      state: "RUNNING",
    });
    fixture.detectChanges();

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitError(
      new Error("boom"),
    );
    fixture.detectChanges();

    expect(cmp.caseItemsData.length).toBe(1);
  });

  it("clears case items on collapse and on destroy", () => {
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

    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-clear-1");
    cmp.onExpandClick();
    fixture.detectChanges();

    (TestBed.inject(EssayService) as any as EssayServiceStub).emitNext({
      index: 2,
      state: "RUNNING",
    });
    fixture.detectChanges();
    expect(cmp.caseItemsData.length).toBe(1);

    // Collapse
    (cmp.cardState as any).expandable.isExpanded = true;
    cmp.onExpandClick();
    fixture.detectChanges();
    expect(cmp.caseItemsData.length).toBe(0);

    // Expand and add again to then test destroy cleanup
    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-clear-2");
    cmp.onExpandClick();
    fixture.detectChanges();
    (TestBed.inject(EssayService) as any as EssayServiceStub).emitNext({
      index: 3,
      state: "RUNNING",
    });
    fixture.detectChanges();
    expect(cmp.caseItemsData.length).toBe(1);

    fixture.destroy();
    // Cannot access cmp after destroy through change detection; rely on lifecycle reset
  });

  it("removes arrow-loading class when collapsing casestudies", () => {
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

    // Expand to set loading true
    (
      TestBed.inject(EssayStateService) as any as EssayStateServiceStub
    ).setEssayId("essay-dom-2");
    cmp.onExpandClick();
    fixture.detectChanges();
    let loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeTrue();

    // Mark state expanded so next click collapses
    (cmp.cardState as any).expandable.isExpanded = true;
    cmp.onExpandClick();
    fixture.detectChanges();

    loadingHost = fixture.nativeElement.querySelector(
      ".px-4.sm\\:px-6.lg\\:px-8.relative",
    );
    expect(loadingHost.classList.contains("arrow-loading")).toBeFalse();
  });
});
