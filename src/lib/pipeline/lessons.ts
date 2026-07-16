import type Database from "better-sqlite3";
import { generateLesson } from "./openai";
import { lessonPrompt } from "./prompts";
import type { Locale } from "../locale";

type Target = { id: number; concept_id: number; name: string; description: string };

export async function createTargetedLesson(db: Database.Database, studentId: number, locale: Locale) {
  const target = db.prepare(`SELECT m.id, m.concept_id, m.name, m.description FROM student_misconception sm
    JOIN misconceptions m ON m.id = sm.misconception_id WHERE sm.student_id = ? ORDER BY sm.strength DESC LIMIT 1`).get(studentId) as Target | undefined;
  if (!target) return null;
  const lesson = await generateLesson(lessonPrompt(target.name, target.description, locale));
  db.prepare("INSERT INTO lessons (student_id, target, content_md, created_at) VALUES (?, ?, ?, ?)").run(studentId, JSON.stringify({ conceptId: target.concept_id, misconceptionId: target.id }), lesson.content_md, new Date().toISOString());
  return lesson;
}
