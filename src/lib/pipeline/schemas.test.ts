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
});
