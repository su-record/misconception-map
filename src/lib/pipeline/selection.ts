import type Database from "better-sqlite3";

export type ConceptSelection = { id: number; slug: string; name: string; mastery: number };

export function selectNextConcept(db: Database.Database, studentId: number): ConceptSelection {
  const result = db.prepare(`
    SELECT c.id, c.slug, c.name, sc.mastery
    FROM student_concept sc JOIN concepts c ON c.id = sc.concept_id
    LEFT JOIN concept_edges edge ON edge.to_id = c.id
    LEFT JOIN student_concept prereq ON prereq.student_id = sc.student_id AND prereq.concept_id = edge.from_id
    WHERE sc.student_id = ?
    ORDER BY CASE WHEN prereq.mastery < 0.55 THEN prereq.mastery ELSE sc.mastery END ASC, c.id ASC
    LIMIT 1
  `).get(studentId) as ConceptSelection | undefined;
  if (!result) throw new Error(`Student ${studentId} has no concept mastery records.`);
  return result;
}
