import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { fixtureEvaluation, fixtureLesson, fixtureQuestion } from "./fixtures";
import { evaluationSchema, lessonSchema, questionSchema, type AnswerEvaluation, type GeneratedQuestion, type MicroLesson } from "./schemas";

type CallProfile = {
  model: "gpt-5.6" | "gpt-5.6-terra";
  reasoningEffort: "high" | "xhigh";
  timeout: number;
};

const INTERACTIVE_PROFILE: CallProfile = {
  model: "gpt-5.6-terra",
  reasoningEffort: "xhigh",
  timeout: 30_000,
};
const LESSON_PROFILE: CallProfile = {
  model: "gpt-5.6",
  reasoningEffort: "high",
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
  return structuredCall<GeneratedQuestion>("fraction_question", questionSchema, prompt, INTERACTIVE_PROFILE);
}

export async function evaluateAnswer(prompt: string): Promise<AnswerEvaluation> {
  if (!process.env.OPENAI_API_KEY) return fixtureEvaluation;
  return structuredCall<AnswerEvaluation>("answer_evaluation", evaluationSchema, prompt, INTERACTIVE_PROFILE);
}

export async function generateLesson(prompt: string): Promise<MicroLesson> {
  if (!process.env.OPENAI_API_KEY) return fixtureLesson;
  return structuredCall<MicroLesson>("micro_lesson", lessonSchema, prompt, LESSON_PROFILE);
}
