import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { evaluateAnswer, generateQuestion } from "@/lib/pipeline/openai";
import { evaluationPrompt, questionPrompt } from "@/lib/pipeline/prompts";
import { questionSchema } from "@/lib/pipeline/schemas";
import { selectNextConcept } from "@/lib/pipeline/selection";
import { storeAnswer } from "@/lib/pipeline/session";

export async function POST(request: Request) {
  const body = await request.json() as { sessionId: number; studentId: number; conceptId: number; question: unknown; answer: string; questionNumber: number };
  const db = getDb();
  const question = questionSchema.parse(body.question);
  const taxonomy = db.prepare("SELECT slug FROM misconceptions WHERE concept_id = ?").all(body.conceptId) as { slug: string }[];
  const evaluation = await evaluateAnswer(evaluationPrompt(question.prompt, body.answer, taxonomy.map((item) => item.slug)));
  storeAnswer(db, { ...body, question, evaluation });
  if (body.questionNumber >= 6) {
    db.prepare("UPDATE sessions SET completed_at = ? WHERE id = ?").run(new Date().toISOString(), body.sessionId);
    return NextResponse.json({ evaluation, complete: true });
  }
  const concept = selectNextConcept(db, body.studentId);
  const nextTaxonomy = db.prepare("SELECT slug FROM misconceptions WHERE concept_id = ?").all(concept.id) as { slug: string }[];
  const nextQuestion = await generateQuestion(questionPrompt(concept.name, nextTaxonomy.map((item) => item.slug), body.questionNumber === 5));
  return NextResponse.json({ evaluation, complete: false, concept, question: nextQuestion });
}
