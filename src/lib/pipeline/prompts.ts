import type { TaxonomyEntry } from "./evaluation";

export function questionPrompt(concept: string, misconceptions: string[], freeResponse: boolean) {
  const allowedSlugs = misconceptions.length ? misconceptions.join(", ") : "none";
  return `Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. Engineer distractors around the provided taxonomy when relevant. Allowed misconception_slug values: ${allowedSlugs}. Every distractor's misconception_slug must be one of those exact values; if none fits, set misconception_slug to null. Never invent or modify a slug. Return only the required structured result.`;
}

export function evaluationPrompt(question: string, answer: string, taxonomy: TaxonomyEntry[]) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n");
  return `Analyze the student's thinking. First match it against the provided taxonomy by meaning, using matched_slug when any entry fits. Propose a new misconception only when no taxonomy entry fits. Write the rationale directly to the student in second person: explain why your thinking pattern leads you astray, without narrating answer options.\nQuestion: ${question}\nStudent answer: ${answer}\nTaxonomy:\n${entries}\nReturn only the required structured result.`;
}

export function lessonPrompt(name: string, description: string) {
  return `Write a roughly three-minute middle-school fractions lesson targeting this misconception: ${name} — ${description}. Name the misconception, show a counterexample that breaks it, and finish with exactly two practice questions. Use concise Markdown and return only the required structured result.`;
}
