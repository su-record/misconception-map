import type Database from "better-sqlite3";
import type { MapData, MapNode } from "@/components/map/types";

type ConceptRow = { id: number; name: string; description: string; mastery: number };
type MisconceptionRow = { id: number; concept_id: number; name: string; description: string; strength: number };

export function getStudentMap(db: Database.Database, studentId: number): MapData {
  const concepts = db.prepare("SELECT c.id, c.name, c.description, sc.mastery FROM concepts c JOIN student_concept sc ON sc.concept_id = c.id WHERE sc.student_id = ?").all(studentId) as ConceptRow[];
  const misconceptions = db.prepare("SELECT m.id, m.concept_id, m.name, m.description, sm.strength FROM misconceptions m JOIN student_misconception sm ON sm.misconception_id = m.id WHERE sm.student_id = ? AND sm.strength > 0.05").all(studentId) as MisconceptionRow[];
  const nodes: MapNode[] = concepts.map((row) => ({ id: `c${row.id}`, kind: "concept", name: row.name, description: row.description, mastery: row.mastery }));
  misconceptions.forEach((row) => nodes.push({ id: `m${row.id}`, kind: "misconception", name: row.name, description: row.description, strength: row.strength, evidence: getEvidence(db, studentId, row.id), lesson: getLesson(db, studentId, row.id) }));
  const prerequisiteLinks = db.prepare("SELECT from_id, to_id FROM concept_edges").all() as { from_id: number; to_id: number }[];
  const links = prerequisiteLinks.map((row) => ({ source: `c${row.from_id}`, target: `c${row.to_id}` }));
  misconceptions.forEach((row) => links.push({ source: `m${row.id}`, target: `c${row.concept_id}` }));
  return { nodes, links };
}

function getEvidence(db: Database.Database, studentId: number, misconceptionId: number) {
  return (db.prepare("SELECT a.student_answer FROM answers a JOIN sessions s ON s.id = a.session_id WHERE s.student_id = ? AND a.extracted_misconception_id = ? ORDER BY a.id DESC LIMIT 3").all(studentId, misconceptionId) as { student_answer: string }[]).map((row) => row.student_answer);
}

function getLesson(db: Database.Database, studentId: number, misconceptionId: number) {
  return (db.prepare("SELECT content_md FROM lessons WHERE student_id = ? AND json_extract(target, '$.misconceptionId') = ? ORDER BY id DESC LIMIT 1").get(studentId, misconceptionId) as { content_md: string } | undefined)?.content_md ?? null;
}
