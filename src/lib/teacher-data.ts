import type Database from "better-sqlite3";
import type { MapData, MapNode } from "@/components/map/types";

export type MisconceptionRank = { id: number; name: string; concept: string; affected: number; averageStrength: number; score: number };
export type ConceptMastery = { id: number; name: string; average: number; values: number[] };

export function getMisconceptionRanking(db: Database.Database) {
  return db.prepare(`SELECT m.id, m.name, c.name concept, COUNT(*) affected, AVG(sm.strength) averageStrength, COUNT(*) * AVG(sm.strength) score
    FROM student_misconception sm JOIN misconceptions m ON m.id = sm.misconception_id JOIN concepts c ON c.id = m.concept_id
    WHERE sm.strength > 0.1 GROUP BY m.id ORDER BY score DESC`).all() as MisconceptionRank[];
}

export function getConceptMastery(db: Database.Database) {
  const rows = db.prepare("SELECT c.id, c.name, sc.mastery FROM concepts c JOIN student_concept sc ON sc.concept_id = c.id ORDER BY c.id, sc.student_id").all() as { id: number; name: string; mastery: number }[];
  const grouped = new Map<number, ConceptMastery>();
  rows.forEach((row) => { const item = grouped.get(row.id) ?? { id: row.id, name: row.name, average: 0, values: [] }; item.values.push(row.mastery); grouped.set(row.id, item); });
  return [...grouped.values()].map((item) => ({ ...item, average: item.values.reduce((sum, value) => sum + value, 0) / item.values.length }));
}

export function getClassMap(db: Database.Database): MapData {
  const mastery = getConceptMastery(db);
  const ranked = getMisconceptionRanking(db);
  const concepts = db.prepare("SELECT id, description FROM concepts").all() as { id: number; description: string }[];
  const misconceptionRows = db.prepare("SELECT id, concept_id, description FROM misconceptions").all() as { id: number; concept_id: number; description: string }[];
  const nodes: MapNode[] = mastery.map((item) => ({ id: `c${item.id}`, kind: "concept", name: item.name, description: concepts.find((row) => row.id === item.id)?.description ?? "", mastery: item.average }));
  ranked.forEach((item) => nodes.push({ id: `m${item.id}`, kind: "misconception", name: item.name, description: misconceptionRows.find((row) => row.id === item.id)?.description ?? "", strength: item.averageStrength }));
  const links = ranked.map((item) => ({ source: `m${item.id}`, target: `c${misconceptionRows.find((row) => row.id === item.id)?.concept_id}` }));
  return { nodes, links };
}
