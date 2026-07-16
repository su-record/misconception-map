import { generateQuestion } from "./openai";
import { questionPrompt } from "./prompts";
import type { TaxonomyEntry } from "./evaluation";
import type { GeneratedQuestion } from "./schemas";

type QuestionGenerator = (prompt: string) => Promise<GeneratedQuestion>;

export async function generateValidatedQuestion(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, generate: QuestionGenerator = generateQuestion) {
  const first = await generate(questionPrompt(concept, taxonomy, freeResponse, false));
  if (validTaxonomyTags(first, taxonomy, freeResponse)) return first;
  const retry = await generate(questionPrompt(concept, taxonomy, freeResponse, true));
  if (validTaxonomyTags(retry, taxonomy, freeResponse)) return retry;
  throw new Error("Question generation failed the misconception tag contract after one retry.");
}

export function validTaxonomyTags(question: GeneratedQuestion, taxonomy: TaxonomyEntry[], freeResponse: boolean) {
  if (freeResponse || taxonomy.length === 0) return true;
  if (question.type !== "multiple_choice") return false;
  const allowed = new Set(taxonomy.map((item) => item.slug));
  const correct = question.choices.find((choice) => choice.label === question.correct_answer || choice.text === question.correct_answer);
  if (!correct || correct.misconception_slug !== null) return false;
  const distractors = question.choices.filter((choice) => choice !== correct);
  return distractors.every((choice) => choice.misconception_slug === null || allowed.has(choice.misconception_slug))
    && distractors.some((choice) => choice.misconception_slug !== null && allowed.has(choice.misconception_slug));
}
