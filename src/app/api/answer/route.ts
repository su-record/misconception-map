import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { evaluateAnswer } from "@/lib/pipeline/openai";
import { questionSchema } from "@/lib/pipeline/schemas";
import { storeAnswer } from "@/lib/pipeline/session";
import { createTargetedLesson } from "@/lib/pipeline/lessons";
import { evaluateKnownChoice, type TaxonomyEntry } from "@/lib/pipeline/evaluation";
import { enforceLlmRateLimit } from "@/lib/api-rate-limit";
import { contentLocale } from "@/lib/content-locale";
import { generateNextQuestion, startQuestionPrefetch, takePrefetchedQuestion } from "@/lib/pipeline/prefetch";

export async function POST(request: Request) {
  const limited = enforceLlmRateLimit(request);
  if (limited) return limited;
  const body = await request.json() as { sessionId: number; studentId: number; conceptId: number; question: unknown; answer: string; questionNumber: number; locale?: unknown };
  const locale = contentLocale(body.locale);
  const db = getDb();
  const question = questionSchema.parse(body.question);
  const taxonomy = db.prepare("SELECT slug, name, description FROM misconceptions WHERE concept_id = ?").all(body.conceptId) as TaxonomyEntry[];
  const evaluation = evaluateKnownChoice(question, body.answer, taxonomy, locale)
    ?? await evaluateAnswer(question.prompt, body.answer, taxonomy, locale);
  storeAnswer(db, { ...body, question, evaluation });
  if (body.questionNumber >= 6) {
    db.prepare("UPDATE sessions SET completed_at = ? WHERE id = ?").run(new Date().toISOString(), body.sessionId);
    const lesson = await createTargetedLesson(db, body.studentId, locale);
    return NextResponse.json({ evaluation, complete: true, lesson });
  }
  const nextNumber = body.questionNumber + 1;
  const next = await takePrefetchedQuestion(body.sessionId, nextNumber, locale)
    ?? await generateNextQuestion(body.studentId, nextNumber, locale);
  startQuestionPrefetch(body.sessionId, body.studentId, nextNumber + 1, locale);
  return NextResponse.json({ evaluation, complete: false, ...next });
}
