import { describe, expect, it } from "vitest";
import { diagnosisPrompt, lessonPrompt, questionPrompt, taxonomyMatchPrompt } from "./prompts";

const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

describe("localized generation prompts", () => {
  it("carries the selected locale into every generated content prompt", () => {
    const question = questionPrompt("Multiplication", taxonomy, false, false, "ko");
    const diagnosis = diagnosisPrompt("What is 3/4 times 1/2?", "3/2", "ja");
    const lesson = lessonPrompt(taxonomy[0].name, taxonomy[0].description, "ko");

    expect(question).toContain("natively in Korean");
    expect(question).toContain("Reason internally in English");
    expect(question).toContain("must never contain reasoning or commentary");
    expect(diagnosis).toContain("natively in Japanese");
    expect(diagnosis).toContain("Reason internally in English");
    expect(taxonomyMatchPrompt("What is 3/4 times 1/2?", "3/2", taxonomy, "ja")).toContain("natively in Japanese");
    expect(lesson).toContain("natively in Korean");
    expect(lesson).toContain("Reason internally in English");
  });
});
