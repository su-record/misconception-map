import { generateQuestion } from "./openai";
import { questionPrompt } from "./prompts";
import type { TaxonomyEntry } from "./evaluation";
import type { GeneratedQuestion } from "./schemas";
import type { Locale } from "../locale";

type QuestionGenerator = (prompt: string) => Promise<GeneratedQuestion>;

export async function generateValidatedQuestion(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, locale: Locale, generate: QuestionGenerator = generateQuestion) {
  const first = await generate(questionPrompt(concept, taxonomy, freeResponse, false, locale));
  if (validQuestionContract(first, taxonomy, freeResponse)) return first;
  const retry = await generate(questionPrompt(concept, taxonomy, freeResponse, true, locale));
  if (validQuestionContract(retry, taxonomy, freeResponse)) return retry;
  throw new Error("Question generation failed its output contract after one retry.");
}

function validQuestionContract(question: GeneratedQuestion, taxonomy: TaxonomyEntry[], freeResponse: boolean) {
  return validTaxonomyTags(question, taxonomy, freeResponse) && validPlainTextMath(question);
}

function validPlainTextMath(question: GeneratedQuestion) {
  const text = [question.prompt, question.correct_answer, question.explanation, ...question.choices.flatMap((choice) => [choice.label, choice.text])];
  return text.every((value) => !value.includes("\\"));
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
