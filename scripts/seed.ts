import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, "mismap.db");
fs.mkdirSync(dataDir, { recursive: true });
if (fs.existsSync(dbPath)) fs.rmSync(dbPath);
const db = new Database(dbPath);
db.exec(fs.readFileSync(path.join(process.cwd(), "migrations", "001_initial.sql"), "utf8"));

const concepts = [
  ["fraction-meaning", "Fraction meaning", "Fractions represent equal parts and quantities."],
  ["number-line", "Fractions on a number line", "Fractions are numbers with positions and magnitude."],
  ["equivalence", "Equivalent fractions", "Different numerators and denominators can name the same value."],
  ["comparison", "Comparing fractions", "Compare fraction size using benchmarks or common forms."],
  ["simplifying", "Simplifying fractions", "Express a fraction in lowest terms without changing its value."],
  ["common-denominators", "Common denominators", "Rename fractions with a shared unit size."],
  ["addition", "Adding fractions", "Combine quantities expressed in equal-sized units."],
  ["subtraction", "Subtracting fractions", "Find a difference using equal-sized units."],
  ["mixed-numbers", "Mixed numbers", "Move between mixed numbers and improper fractions."],
  ["multiplication", "Multiplying fractions", "Find a fraction of a quantity."],
  ["multiplication-effect", "Multiplication effect", "Predict when multiplication increases or decreases a value."],
  ["reciprocals", "Reciprocals", "Understand multiplicative inverses."],
  ["division", "Dividing fractions", "Interpret and calculate fraction quotients."],
  ["division-by-fraction", "Division by a fraction", "Understand how many fractional groups fit in a quantity."],
  ["word-problems", "Fraction word problems", "Choose operations from contextual relationships."],
] as const;
const insertConcept = db.prepare("INSERT INTO concepts (slug, name, description) VALUES (?, ?, ?)");
concepts.forEach((concept) => insertConcept.run(...concept));
const conceptIds = new Map<string, number>((db.prepare("SELECT id, slug FROM concepts").all() as { id: number; slug: string }[]).map((row) => [row.slug, row.id]));
const edges = [["fraction-meaning", "number-line"], ["fraction-meaning", "equivalence"], ["number-line", "comparison"], ["equivalence", "simplifying"], ["equivalence", "common-denominators"], ["common-denominators", "addition"], ["common-denominators", "subtraction"], ["addition", "mixed-numbers"], ["multiplication", "multiplication-effect"], ["multiplication", "reciprocals"], ["reciprocals", "division"], ["division", "division-by-fraction"], ["mixed-numbers", "word-problems"], ["division-by-fraction", "word-problems"]];
const insertEdge = db.prepare("INSERT INTO concept_edges VALUES (?, ?)");
edges.forEach(([from, to]) => insertEdge.run(conceptIds.get(from), conceptIds.get(to)));

const misconceptions = [
  ["fraction-meaning", "count-parts-not-whole", "Count parts without defining the whole", "Treats numerator and denominator as counts without relating selected equal parts to one whole."],
  ["number-line", "two-whole-number-positions", "Two whole-number positions", "Places the numerator and denominator as separate whole-number points instead of locating one fractional magnitude."],
  ["equivalence", "same-numbers-same-value", "Only identical fractions are equivalent", "Assumes equivalent fractions must look identical."],
  ["comparison", "larger-denominator-larger", "A larger denominator means a larger fraction", "Compares denominator digits instead of unit sizes."],
  ["simplifying", "subtract-to-simplify", "Simplify by subtracting", "Subtracts the same number from numerator and denominator."],
  ["addition", "add-straight-across", "Add straight across", "Adds numerators and denominators as separate whole numbers."],
  ["subtraction", "subtract-straight-across", "Subtract straight across", "Subtracts both numerator and denominator."],
  ["common-denominators", "change-denominator-only", "Change only the denominator", "Renames a denominator without scaling the numerator."],
  ["mixed-numbers", "ignore-whole-number", "Ignore the whole number", "Operates only on the fractional part of a mixed number."],
  ["multiplication", "cross-add", "Cross-add when multiplying", "Uses an invented diagonal addition procedure."],
  ["multiplication-effect", "multiplication-always-bigger", "Multiplication always makes bigger", "Expects every product to exceed both factors."],
  ["division", "divide-straight-across", "Divide straight across", "Divides corresponding numerator and denominator without reasoning about the quotient."],
  ["division-by-fraction", "division-always-smaller", "Division always makes smaller", "Expects every quotient to be smaller than the dividend."],
  ["reciprocals", "flip-first-fraction", "Flip the first fraction", "Inverts the dividend rather than the divisor."],
  ["word-problems", "keyword-operation", "Choose an operation by keywords", "Selects an operation from isolated cue words instead of reasoning about relationships between quantities."],
] as const;
const insertMisconception = db.prepare("INSERT INTO misconceptions (concept_id, slug, name, description) VALUES (?, ?, ?, ?)");
misconceptions.forEach(([concept, ...values]) => insertMisconception.run(conceptIds.get(concept), ...values));

const studentNames = ["Maya Chen", "Leo Garcia", "Ava Thompson", "Noah Williams", "Sofia Patel", "Ethan Kim", "Zoe Brown", "Lucas Martin"];
const insertStudent = db.prepare("INSERT INTO students (name) VALUES (?)");
studentNames.forEach((name) => insertStudent.run(name));
const students = db.prepare("SELECT id FROM students").all() as { id: number }[];
const conceptRows = db.prepare("SELECT id FROM concepts").all() as { id: number }[];
const insertMastery = db.prepare("INSERT INTO student_concept VALUES (?, ?, ?)");
students.forEach(({ id: studentId }) => conceptRows.forEach(({ id: conceptId }) => insertMastery.run(studentId, conceptId, Math.min(0.92, 0.28 + ((studentId * 7 + conceptId * 3) % 60) / 100))));

const misconceptionRows = db.prepare("SELECT id, concept_id, slug FROM misconceptions").all() as { id: number; concept_id: number; slug: string }[];
const insertState = db.prepare("INSERT INTO student_misconception VALUES (?, ?, ?, ?, ?)");
const insertSession = db.prepare("INSERT INTO sessions (student_id, started_at, completed_at) VALUES (?, ?, ?)");
const insertAnswer = db.prepare("INSERT INTO answers (session_id, concept_id, question, student_answer, is_correct, extracted_misconception_id, rationale) VALUES (?, ?, ?, ?, 0, ?, ?)");
students.forEach(({ id: studentId }) => {
  const selected = misconceptionRows.filter((_, index) => (index + studentId) % 3 === 0).slice(0, 4);
  const date = new Date(Date.UTC(2026, 6, 10 + studentId)).toISOString();
  const sessionId = Number(insertSession.run(studentId, date, date).lastInsertRowid);
  selected.forEach((item, index) => {
    const strength = 0.38 + ((studentId + index * 2) % 6) / 10;
    insertState.run(studentId, item.id, Math.min(0.95, strength), 1 + ((studentId + index) % 3), date);
    insertAnswer.run(sessionId, item.concept_id, JSON.stringify({ prompt: "Explain your reasoning for this fraction problem.", choices: [] }), "I used the rule that seemed to fit the numbers.", item.id, `The response is consistent with ${item.slug}.`);
  });
});
db.close();
process.stdout.write(`Seeded ${dbPath} with ${concepts.length} concepts, ${misconceptions.length} misconceptions, and ${students.length} students.\n`);
