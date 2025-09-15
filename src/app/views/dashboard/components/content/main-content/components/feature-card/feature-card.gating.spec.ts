import { TestBed } from "@angular/core/testing";
import { FeatureCardComponent } from "./feature-card.component";
import { EssayStateService } from "@/app/services/essay-state.service";
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

// Minimal host to satisfy standalone imports
@Component({
  standalone: true,
  imports: [CommonModule, FeatureCardComponent],
  template: "",
})
class HostComponent {}

class EssayStateServiceStub {
  private allowed = false;
  setAllowed(v: boolean) {
    this.allowed = v;
  }
  isInteractionAllowed(contentType: string): boolean {
    if (contentType === "casestudies") return this.allowed;
    return true;
  }
  isArgumentsLoading() {
    return false as const;
  }
  isScholarsLoading() {
    return false as const;
  }
}

describe("FeatureCardComponent casestudies expand gating", () => {
  let component: FeatureCardComponent;
  let essayStateStub: EssayStateServiceStub;

  beforeEach(() => {
    essayStateStub = new EssayStateServiceStub();
    TestBed.configureTestingModule({
      imports: [FeatureCardComponent],
      providers: [{ provide: EssayStateService, useValue: essayStateStub }],
    });
    component = TestBed.createComponent(FeatureCardComponent).componentInstance;
    component.featureCard = {
      id: "casestudies",
      title: "Relevant case studies",
      iconPath: "",
      iconAlt: "",
    } as any;
    component.cardState = {
      expandable: { isExpanded: false, contentType: "casestudies" },
      showGradient: false,
      isPersistent: false,
    } as any;
  });

  it("disables expand when casestudies interaction is not allowed", () => {
    essayStateStub.setAllowed(false);
    expect(component.isExpandDisabled).toBeTrue();
  });

  it("enables expand when casestudies interaction is allowed", () => {
    essayStateStub.setAllowed(true);
    expect(component.isExpandDisabled).toBeFalse();
  });
});
