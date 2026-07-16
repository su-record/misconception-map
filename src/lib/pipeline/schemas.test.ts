import { describe, expect, it } from "vitest";
import fixture from "../../../fixtures/pipeline.json";
import { evaluationSchema, lessonSchema, questionSchema } from "./schemas";

describe("structured extraction schemas", () => {
  it("parses the recorded question and evaluation", () => {
    expect(questionSchema.parse(fixture.question).correct_answer).toBe("A");
    expect(evaluationSchema.parse(fixture.evaluation).misconception?.matched_slug).toBe("multiplication-always-bigger");
    expect(lessonSchema.parse(fixture.lesson).content_md).toContain("counterexample");
  });

  it("rejects ambiguous evaluation output", () => {
    expect(() => evaluationSchema.parse({ is_correct: "maybe", rationale: "" })).toThrow();
  });

  it("normalizes empty slug strings to null", () => {
    const question = questionSchema.parse({ ...fixture.question, choices: fixture.question.choices.map((choice) => ({ ...choice, misconception_slug: "  " })) });
    const evaluation = evaluationSchema.parse({ ...fixture.evaluation, misconception: { matched_slug: "", proposed_new: null } });
    expect(question.choices.every((choice) => choice.misconception_slug === null)).toBe(true);
    expect(evaluation.misconception?.matched_slug).toBeNull();
  });
});
