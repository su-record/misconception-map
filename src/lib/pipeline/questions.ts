import { fixtureQuestion } from "./fixtures";
import { generateQuestion, generateQuestionWithTerra } from "./openai";
import { questionPrompt } from "./prompts";
import type { TaxonomyEntry } from "./evaluation";
import type { GeneratedQuestion } from "./schemas";
import type { Locale } from "../locale";

type QuestionGenerator = (prompt: string) => Promise<GeneratedQuestion>;
type QuestionOptions = {
  delivery?: "interactive" | "prefetch";
  sol?: QuestionGenerator;
  terra?: QuestionGenerator;
};

export async function generateValidatedQuestion(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, locale: Locale, options: QuestionOptions = {}) {
  if (!process.env.OPENAI_API_KEY && !options.sol && !options.terra) return fixtureQuestion;
  const sol = options.sol ?? generateQuestion;
  const terra = options.terra ?? generateQuestionWithTerra;
  const useSol = options.delivery === "prefetch" && locale === "en";
  const attempts = useSol
    ? [{ generate: sol, retry: false }, { generate: sol, retry: true }, { generate: terra, retry: true }]
    : [{ generate: terra, retry: false }];
  for (const attempt of attempts) {
    const question = await tryQuestion(attempt.generate, questionPrompt(concept, taxonomy, freeResponse, attempt.retry, locale));
    if (question && validQuestionContract(question, taxonomy, freeResponse)) return question;
  }
  console.warn("[pipeline] Question generation exhausted its model route; using the recorded fixture.");
  return fixtureQuestion;
}

async function tryQuestion(generate: QuestionGenerator, prompt: string) {
  try {
    return await generate(prompt);
  } catch {
    return null;
  }
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
