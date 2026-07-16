import { describe, expect, it, vi } from "vitest";
import fixture from "../../../fixtures/pipeline.json";
import { generateValidatedQuestion } from "./questions";
import { questionSchema } from "./schemas";

describe("generateValidatedQuestion", () => {
  it("retries once when taxonomy exists but every distractor tag is null", async () => {
    const valid = questionSchema.parse(fixture.question);
    const untagged = { ...valid, choices: valid.choices.map((choice) => ({ ...choice, misconception_slug: null })) };
    const generate = vi.fn().mockResolvedValueOnce(untagged).mockResolvedValueOnce(valid);
    const taxonomy = [{ slug: "multiplication-always-bigger", name: "Multiplication always makes bigger", description: "Expects every product to exceed both factors." }];

    const result = await generateValidatedQuestion("Multiplication effect", taxonomy, false, generate);

    expect(generate).toHaveBeenCalledTimes(2);
    expect(result.choices.some((choice) => choice.misconception_slug === taxonomy[0].slug)).toBe(true);
  });
});
