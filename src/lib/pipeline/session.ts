import type Database from "better-sqlite3";
import { updateGraph, type GraphState } from "./graph-update";
import type { AnswerEvaluation, GeneratedQuestion } from "./schemas";

type StoredState = { strength: number; evidence_count: number };

function matchedId(db: Database.Database, slug: string | null | undefined) {
  if (!slug) return null;
  return (db.prepare("SELECT id FROM misconceptions WHERE slug = ?").get(slug) as { id: number } | undefined)?.id ?? null;
}

export function storeAnswer(db: Database.Database, input: { sessionId: number; studentId: number; conceptId: number; question: GeneratedQuestion; answer: string; evaluation: AnswerEvaluation }) {
  const misconceptionId = matchedId(db, input.evaluation.misconception?.matched_slug);
  const mastery = (db.prepare("SELECT mastery FROM student_concept WHERE student_id = ? AND concept_id = ?").get(input.studentId, input.conceptId) as { mastery: number }).mastery;
  const state = misconceptionId ? db.prepare("SELECT strength, evidence_count FROM student_misconception WHERE student_id = ? AND misconception_id = ?").get(input.studentId, misconceptionId) as StoredState | undefined : undefined;
  const next = updateGraph({ mastery, misconceptionStrength: state?.strength ?? 0, evidenceCount: state?.evidence_count ?? 0 }, { isCorrect: input.evaluation.is_correct, matchedMisconception: misconceptionId !== null });
  db.prepare("UPDATE student_concept SET mastery = ? WHERE student_id = ? AND concept_id = ?").run(next.mastery, input.studentId, input.conceptId);
  if (misconceptionId) upsertMisconception(db, input.studentId, misconceptionId, next);
  db.prepare("INSERT INTO answers (session_id, concept_id, question, student_answer, is_correct, extracted_misconception_id, rationale) VALUES (?, ?, ?, ?, ?, ?, ?)").run(input.sessionId, input.conceptId, JSON.stringify(input.question), input.answer, Number(input.evaluation.is_correct), misconceptionId, input.evaluation.rationale);
}

function upsertMisconception(db: Database.Database, studentId: number, misconceptionId: number, next: GraphState) {
  db.prepare(`INSERT INTO student_misconception (student_id, misconception_id, strength, evidence_count, last_seen_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(student_id, misconception_id) DO UPDATE SET strength = excluded.strength, evidence_count = excluded.evidence_count, last_seen_at = excluded.last_seen_at`)
    .run(studentId, misconceptionId, next.misconceptionStrength, next.evidenceCount, new Date().toISOString());
}
