import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { fixtureDiagnosis, fixtureLesson, fixtureQuestion, fixtureTaxonomyMatch } from "./fixtures";
import { mergeEvaluation, type TaxonomyEntry } from "./evaluation";
import { diagnosisPrompt, taxonomyMatchPrompt } from "./prompts";
import { diagnosisSchema, lessonSchema, questionSchema, taxonomyMatchSchema, type AnswerEvaluation, type GeneratedQuestion, type MicroLesson } from "./schemas";
import type { Locale } from "../locale";

type CallProfile = {
  model: "gpt-5.6" | "gpt-5.6-terra" | "gpt-5.6-luna";
  reasoningEffort: "low" | "xhigh";
  timeout: number;
};

const QUESTION_PROFILE: CallProfile = {
  model: "gpt-5.6",
  reasoningEffort: "xhigh",
  timeout: 60_000,
};
const DIAGNOSIS_PROFILE: CallProfile = {
  model: "gpt-5.6-terra",
  reasoningEffort: "xhigh",
  timeout: 30_000,
};
const TAXONOMY_PROFILE: CallProfile = {
  model: "gpt-5.6-luna",
  reasoningEffort: "low",
  timeout: 15_000,
};
const LESSON_PROFILE: CallProfile = {
  model: "gpt-5.6",
  reasoningEffort: "xhigh",
  timeout: 60_000,
};

async function structuredCall<T>(name: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>, prompt: string, profile: CallProfile) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: profile.timeout });
  const response = await client.responses.parse({
    model: profile.model,
    reasoning: { effort: profile.reasoningEffort },
    input: prompt,
    text: { format: zodTextFormat(schema, name) },
  });
  const parsed = response.output_parsed;
  if (!parsed) throw new Error(`The ${name} response was empty.`);
  return parsed as T;
}

export async function generateQuestion(prompt: string): Promise<GeneratedQuestion> {
  if (!process.env.OPENAI_API_KEY) return fixtureQuestion;
  return structuredCall<GeneratedQuestion>("fraction_question", questionSchema, prompt, QUESTION_PROFILE);
}

export async function generateQuestionWithTerra(prompt: string): Promise<GeneratedQuestion> {
  if (!process.env.OPENAI_API_KEY) return fixtureQuestion;
  return structuredCall<GeneratedQuestion>("fraction_question_fallback", questionSchema, prompt, DIAGNOSIS_PROFILE);
}

export async function evaluateAnswer(question: string, answer: string, taxonomy: TaxonomyEntry[], locale: Locale): Promise<AnswerEvaluation> {
  if (!process.env.OPENAI_API_KEY) return mergeEvaluation(fixtureDiagnosis, fixtureTaxonomyMatch);
  try {
    const [diagnosis, match] = await Promise.all([
      structuredCall("answer_diagnosis", diagnosisSchema, diagnosisPrompt(question, answer, locale), DIAGNOSIS_PROFILE),
      structuredCall("taxonomy_match", taxonomyMatchSchema, taxonomyMatchPrompt(question, answer, taxonomy, locale), TAXONOMY_PROFILE),
    ]);
    if (match.matched_slug && !taxonomy.some((entry) => entry.slug === match.matched_slug)) {
      throw new Error("Taxonomy matching returned a slug outside the provided taxonomy.");
    }
    return mergeEvaluation(diagnosis, match);
  } catch {
    console.warn("[pipeline] Evaluation LLM failed; using the recorded fixture.");
    return mergeEvaluation(fixtureDiagnosis, fixtureTaxonomyMatch);
  }
}

export async function generateLesson(prompt: string): Promise<MicroLesson> {
  if (!process.env.OPENAI_API_KEY) return fixtureLesson;
  try {
    return await structuredCall<MicroLesson>("micro_lesson", lessonSchema, prompt, LESSON_PROFILE);
  } catch {
    console.warn("[pipeline] Lesson LLM failed; using the recorded fixture.");
    return fixtureLesson;
  }
}
