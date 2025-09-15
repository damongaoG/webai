import { EssayCreationPhase, EssayStateService } from "./essay-state.service";

describe("EssayCreationPhase enum", () => {
  it("should include CASE_SELECTED with value 'case_selected'", () => {
    expect(EssayCreationPhase.CASE_SELECTED).toBe("case_selected");
  });
});

describe("EssayStateService setSelectedScholarIds phase transitions", () => {
  let service: EssayStateService;

  beforeEach(() => {
    service = new EssayStateService();
  });

  it("should move to CASE_SELECTED when scholarIds becomes non-empty", () => {
    service.setSelectedScholarIds(["s1"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.CASE_SELECTED);
  });

  it("should move back to ARGUMENT_SELECTED when scholarIds becomes empty", () => {
    service.setSelectedScholarIds(["s1"]);
    service.setSelectedScholarIds([]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.ARGUMENT_SELECTED);
  });
});

describe("EssayStateService permissions for casestudies", () => {
  let service: EssayStateService;

  beforeEach(() => {
    service = new EssayStateService();
  });

  it("should not allow casestudies when in SCHOLARS_SELECTED with no selected scholars", () => {
    // move to arguments first
    service.setSelectedKeywords(["k1"]);
    service.setSelectedArgumentIds(["a1"]);
    // simulate scholars fetched success advances to SCHOLARS_SELECTED
    service.advancePhaseAfterScholarsFetchSuccess();
    expect(service.isInteractionAllowed("casestudies")).toBeFalse();
  });

  it("should allow casestudies when selectedScholarIds is non-empty (CASE_SELECTED)", () => {
    service.setSelectedKeywords(["k1"]);
    service.setSelectedArgumentIds(["a1"]);
    service.advancePhaseAfterScholarsFetchSuccess();
    service.setSelectedScholarIds(["s1"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.CASE_SELECTED);
    expect(service.isInteractionAllowed("casestudies")).toBeTrue();
  });

  it("undo revert from CASE_SELECTED moves back to ARGUMENT_SELECTED", () => {
    service.setSelectedKeywords(["k1"]);
    service.setSelectedArgumentIds(["a1"]);
    service.advancePhaseAfterScholarsFetchSuccess();
    service.setSelectedScholarIds(["s1"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.CASE_SELECTED);
    service.revertToArgumentSelectedAfterUndo();
    expect(service.currentPhase()).toBe(EssayCreationPhase.ARGUMENT_SELECTED);
  });
});

describe("EssayStateService minimal flow", () => {
  let service: EssayStateService;

  beforeEach(() => {
    service = new EssayStateService();
  });

  it("title -> keywords -> arguments -> scholars_selected -> case_selected then back", () => {
    // Title created
    service.setEssayTitle("T");
    expect(service.currentPhase()).toBe(EssayCreationPhase.TITLE_CREATED);
    // Select keywords
    service.setSelectedKeywords(["k1", "k2"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.KEYWORDS_SELECTED);
    // Select arguments advances to ARGUMENT_SELECTED
    service.setSelectedArgumentIds(["a1"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.ARGUMENT_SELECTED);
    // Simulate scholars fetch success
    service.advancePhaseAfterScholarsFetchSuccess();
    expect(service.currentPhase()).toBe(EssayCreationPhase.SCHOLARS_SELECTED);
    // casestudies disabled until selection
    expect(service.isInteractionAllowed("casestudies")).toBeFalse();
    // Select scholars -> CASE_SELECTED and casestudies enabled
    service.setSelectedScholarIds(["s1"]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.CASE_SELECTED);
    expect(service.isInteractionAllowed("casestudies")).toBeTrue();
    // Clear scholars -> back to ARGUMENT_SELECTED, casestudies disabled
    service.setSelectedScholarIds([]);
    expect(service.currentPhase()).toBe(EssayCreationPhase.ARGUMENT_SELECTED);
    expect(service.isInteractionAllowed("casestudies")).toBeFalse();
  });
});
