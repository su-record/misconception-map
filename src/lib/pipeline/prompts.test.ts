import { describe, expect, it } from "vitest";
import { evaluationPrompt, lessonPrompt, questionPrompt } from "./prompts";

const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

describe("localized generation prompts", () => {
  it("carries the selected locale into every generated content prompt", () => {
    expect(questionPrompt("Multiplication", taxonomy, false, false, "ko")).toContain("natively in Korean");
    expect(evaluationPrompt("What is 3/4 times 1/2?", "3/2", taxonomy, "ja")).toContain("natively in Japanese");
    expect(lessonPrompt(taxonomy[0].name, taxonomy[0].description, "ko")).toContain("natively in Korean");
  });
});
