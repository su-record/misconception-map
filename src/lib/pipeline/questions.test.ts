import { describe, expect, it, vi } from "vitest";
import fixture from "../../../fixtures/pipeline.json";
import { generateValidatedQuestion, validTaxonomyTags } from "./questions";
import { questionSchema } from "./schemas";

describe("generateValidatedQuestion", () => {
  it("retries once when taxonomy exists but every distractor tag is null", async () => {
    const valid = questionSchema.parse(fixture.question);
    const untagged = { ...valid, choices: valid.choices.map((choice) => ({ ...choice, misconception_slug: null })) };
    const generate = vi.fn().mockResolvedValueOnce(untagged).mockResolvedValueOnce(valid);
    const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

    const result = await generateValidatedQuestion("Multiplication effect", taxonomy, false, "en", { primary: generate });

    expect(generate).toHaveBeenCalledTimes(2);
    expect(result.choices.some((choice) => choice.misconception_slug === taxonomy[0].slug)).toBe(true);
  });

  it("rejects a non-empty slug outside the taxonomy", () => {
    const question = questionSchema.parse({ ...fixture.question, choices: fixture.question.choices.map((choice, index) => index === 2 ? { ...choice, misconception_slug: "invented-slug" } : choice) });
    const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];
    expect(validTaxonomyTags(question, taxonomy, false)).toBe(false);
  });

  it("retries once when generated math contains a backslash command", async () => {
    const valid = questionSchema.parse(fixture.question);
    const latex = { ...valid, prompt: "What is \\frac{3}{4} times 1/2?" };
    const generate = vi.fn().mockResolvedValueOnce(latex).mockResolvedValueOnce(valid);
    const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

    const result = await generateValidatedQuestion("Multiplication effect", taxonomy, false, "en", { primary: generate });

    expect(generate).toHaveBeenCalledTimes(2);
    expect(result.prompt).not.toContain("\\");
  });

  it("falls through two sol attempts to terra, then the fixture", async () => {
    const valid = questionSchema.parse(fixture.question);
    const invalid = { ...valid, choices: valid.choices.map((choice) => ({ ...choice, misconception_slug: null })) };
    const primary = vi.fn().mockRejectedValueOnce(new Error("sol unavailable")).mockResolvedValueOnce(invalid);
    const fallback = vi.fn().mockResolvedValue(invalid);
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

    const result = await generateValidatedQuestion("Multiplication effect", taxonomy, false, "en", { primary, fallback });

    expect(primary).toHaveBeenCalledTimes(2);
    expect(fallback).toHaveBeenCalledTimes(1);
    expect(result).toEqual(valid);
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });
});
