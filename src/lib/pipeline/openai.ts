import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { fixtureEvaluation, fixtureQuestion } from "./fixtures";
import { evaluationSchema, questionSchema, type AnswerEvaluation, type GeneratedQuestion } from "./schemas";

const MODEL = "gpt-5.6";

async function structuredCall<T>(name: string, schema: typeof questionSchema | typeof evaluationSchema, prompt: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.beta.chat.completions.parse({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(schema, name),
  });
  const parsed = response.choices[0]?.message.parsed;
  if (!parsed) throw new Error(`The ${name} response was empty.`);
  return parsed as T;
}

export async function generateQuestion(prompt: string): Promise<GeneratedQuestion> {
  if (!process.env.OPENAI_API_KEY) return fixtureQuestion;
  return structuredCall<GeneratedQuestion>("fraction_question", questionSchema, prompt);
}

export async function evaluateAnswer(prompt: string): Promise<AnswerEvaluation> {
  if (!process.env.OPENAI_API_KEY) return fixtureEvaluation;
  return structuredCall<AnswerEvaluation>("answer_evaluation", evaluationSchema, prompt);
}
