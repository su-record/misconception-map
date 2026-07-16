import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateQuestion } from "@/lib/pipeline/openai";
import { questionPrompt } from "@/lib/pipeline/prompts";
import { selectNextConcept } from "@/lib/pipeline/selection";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDb();
  const studentId = Number(new URL(request.url).searchParams.get("studentId") ?? 1);
  const concept = selectNextConcept(db, studentId);
  const taxonomy = db.prepare("SELECT slug FROM misconceptions WHERE concept_id = ?").all(concept.id) as { slug: string }[];
  const question = await generateQuestion(questionPrompt(concept.name, taxonomy.map((item) => item.slug), false));
  const session = db.prepare("INSERT INTO sessions (student_id, started_at) VALUES (?, ?)").run(studentId, new Date().toISOString());
  const students = db.prepare("SELECT id, name FROM students ORDER BY id").all();
  return NextResponse.json({ students, sessionId: Number(session.lastInsertRowid), concept, question });
}
