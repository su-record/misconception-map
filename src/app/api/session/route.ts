import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { selectNextConcept } from "@/lib/pipeline/selection";
import { generateValidatedQuestion } from "@/lib/pipeline/questions";
import type { TaxonomyEntry } from "@/lib/pipeline/evaluation";
import { enforceLlmRateLimit } from "@/lib/api-rate-limit";
import { isDemoMode } from "@/lib/demo";
import { contentLocale } from "@/lib/content-locale";
import { startQuestionPrefetch } from "@/lib/pipeline/prefetch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = enforceLlmRateLimit(request);
  if (limited) return limited;
  const db = getDb();
  const searchParams = new URL(request.url).searchParams;
  const studentId = Number(searchParams.get("studentId") ?? 1);
  const locale = contentLocale(searchParams.get("locale"));
  const concept = selectNextConcept(db, studentId);
  const taxonomy = db.prepare("SELECT slug, name, description FROM misconceptions WHERE concept_id = ?").all(concept.id) as TaxonomyEntry[];
  const question = await generateValidatedQuestion(concept.name, taxonomy, false, locale, { delivery: "interactive" });
  const session = db.prepare("INSERT INTO sessions (student_id, started_at) VALUES (?, ?)").run(studentId, new Date().toISOString());
  const sessionId = Number(session.lastInsertRowid);
  startQuestionPrefetch(sessionId, studentId, 2, locale);
  const students = db.prepare("SELECT id, name FROM students ORDER BY id").all();
  return NextResponse.json({ students, sessionId, concept, question, demoMode: isDemoMode() });
}
