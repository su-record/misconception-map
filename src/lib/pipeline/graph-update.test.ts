import { describe, expect, it } from "vitest";
import { updateGraph } from "./graph-update";

describe("updateGraph", () => {
  it("raises mastery and decays misconception strength for correct evidence", () => {
    expect(updateGraph({ mastery: 0.5, misconceptionStrength: 0.6, evidenceCount: 2 }, { isCorrect: true, matchedMisconception: true })).toEqual({ mastery: 0.62, misconceptionStrength: 0.43999999999999995, evidenceCount: 2 });
  });

  it("bumps matched misconceptions and lowers mastery", () => {
    expect(updateGraph({ mastery: 0.5, misconceptionStrength: 0.6, evidenceCount: 2 }, { isCorrect: false, matchedMisconception: true, confidence: 0.5 })).toEqual({ mastery: 0.46, misconceptionStrength: 0.71, evidenceCount: 3 });
  });

  it("clamps all values to their valid range", () => {
    expect(updateGraph({ mastery: 0.98, misconceptionStrength: 0.02, evidenceCount: 1 }, { isCorrect: true, matchedMisconception: true })).toEqual({ mastery: 1, misconceptionStrength: 0, evidenceCount: 1 });
  });
});
