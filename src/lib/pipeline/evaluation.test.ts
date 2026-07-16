import { describe, expect, it } from "vitest";
import fixture from "../../../fixtures/pipeline.json";
import { evaluateKnownChoice } from "./evaluation";
import { questionSchema } from "./schemas";

describe("evaluateKnownChoice", () => {
  it("uses a tagged distractor without proposing a new misconception", () => {
    const question = questionSchema.parse(fixture.question);
    const result = evaluateKnownChoice(question, "B", [{
      slug: "multiplication-always-bigger",
      name: "Multiplication always makes bigger",
      description: "Multiplying by a proper fraction can reduce a quantity.",
    }]);

    expect(result?.is_correct).toBe(false);
    expect(result?.misconception).toEqual({ matched_slug: "multiplication-always-bigger", proposed_new: null });
    expect(result?.rationale).toMatch(/^You/);
  });
});
