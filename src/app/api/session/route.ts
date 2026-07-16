import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { selectNextConcept } from "@/lib/pipeline/selection";
import { generateValidatedQuestion } from "@/lib/pipeline/questions";
import type { TaxonomyEntry } from "@/lib/pipeline/evaluation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDb();
  const studentId = Number(new URL(request.url).searchParams.get("studentId") ?? 1);
  const concept = selectNextConcept(db, studentId);
  const taxonomy = db.prepare("SELECT slug, name, description FROM misconceptions WHERE concept_id = ?").all(concept.id) as TaxonomyEntry[];
  const question = await generateValidatedQuestion(concept.name, taxonomy, false);
  const session = db.prepare("INSERT INTO sessions (student_id, started_at) VALUES (?, ?)").run(studentId, new Date().toISOString());
  const students = db.prepare("SELECT id, name FROM students ORDER BY id").all();
  return NextResponse.json({ students, sessionId: Number(session.lastInsertRowid), concept, question });
}
