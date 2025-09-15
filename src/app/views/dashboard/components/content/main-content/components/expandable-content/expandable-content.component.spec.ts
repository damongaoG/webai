import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { ExpandableContentComponent } from "./expandable-content.component";
import { type ModelCaseVO } from "@/app/interfaces/model-case.interface";
import { ContentType } from "@/app/services/sidebar-state.service";

class EssayStateServiceStub {
  isInteractionAllowed(): boolean {
    return true;
  }
  // The following methods are unused in these tests but are part of the component's dependencies
  selectedScholarIds(): string[] {
    return [];
  }
  addSelectedScholarId(_: string): void {}
  removeSelectedScholarId(_: string): void {}
  addSelectedKeyword(_: string): void {}
  removeSelectedKeyword(_: string): void {}
  addSelectedArgumentId(_: string): void {}
  removeSelectedArgumentId(_: string): void {}
}

class SidebarStateServiceStub {
  selectedContent(): ContentType {
    return ContentType.ESSAY_MODEL;
  }
}

describe("ExpandableContentComponent (casestudies loading UX)", () => {
  let fixture: ComponentFixture<ExpandableContentComponent>;
  let component: ExpandableContentComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ExpandableContentComponent],
      providers: [
        {
          provide: (await import("@/app/services/essay-state.service"))
            .EssayStateService,
          useClass: EssayStateServiceStub,
        },
        {
          provide: (await import("@/app/services/sidebar-state.service"))
            .SidebarStateService,
          useClass: SidebarStateServiceStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableContentComponent);
    component = fixture.componentInstance;
  });

  function setInputs({
    isExpanded = true,
    isCasesLoading = false,
    caseItems = [],
  }: {
    isExpanded?: boolean;
    isCasesLoading?: boolean;
    caseItems?: ReadonlyArray<ModelCaseVO>;
  }) {
    component.expandableState = {
      isExpanded,
      contentType: "casestudies",
      animating: false,
    } as any;
    component.isCasesLoading = isCasesLoading;
    component.caseItems = caseItems;
    fixture.detectChanges();
  }

  it("shows loader when expanded, casestudies, and loading without items", () => {
    setInputs({ isExpanded: true, isCasesLoading: true, caseItems: [] });
    const loader = fixture.nativeElement.querySelector(
      ".casestudies-inline-loading",
    );
    expect(loader).toBeTruthy();

    const empty = fixture.nativeElement.querySelector(".cases-empty");
    expect(empty).toBeFalsy();

    const list = fixture.nativeElement.querySelector(".casestudies-list");
    expect(list).toBeFalsy();
  });

  it("shows empty state when not loading and no items", () => {
    setInputs({ isExpanded: true, isCasesLoading: false, caseItems: [] });
    const loader = fixture.nativeElement.querySelector(
      ".casestudies-inline-loading",
    );
    expect(loader).toBeFalsy();

    const empty = fixture.nativeElement.querySelector(".cases-empty");
    expect(empty).toBeTruthy();
  });

  it("shows list when items exist and hides loader", () => {
    const items: ReadonlyArray<ModelCaseVO> = [
      {
        index: 0,
        state: "RUNNING",
        results: [
          {
            title: "Case A",
            background: "",
            methodology: "",
            findings: "",
          } as any,
        ],
      } as any,
    ];
    setInputs({ isExpanded: true, isCasesLoading: false, caseItems: items });

    const loader = fixture.nativeElement.querySelector(
      ".casestudies-inline-loading",
    );
    expect(loader).toBeFalsy();

    const list = fixture.nativeElement.querySelector(".casestudies-list");
    expect(list).toBeTruthy();
  });
});
