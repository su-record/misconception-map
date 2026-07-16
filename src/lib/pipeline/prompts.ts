import type { TaxonomyEntry } from "./evaluation";

export function questionPrompt(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, retry: boolean) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n") || "none";
  const contract = freeResponse || taxonomy.length === 0 ? "Use null for every misconception_slug." : "You MUST engineer at least one incorrect distractor around one provided misconception and tag it with that exact slug. Other distractors may use null. The correct answer MUST use null.";
  const correction = retry ? "Your previous result violated the tag contract. Correct it now. " : "";
  return `${correction}Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. ${contract} Never invent, modify, or reuse a slug outside this taxonomy:\n${entries}\nReturn only the required structured result.`;
}

export function evaluationPrompt(question: string, answer: string, taxonomy: TaxonomyEntry[]) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n");
  return `Analyze the student's thinking. First match it against the provided taxonomy by meaning, using matched_slug when any entry fits. Propose a new misconception only when no taxonomy entry fits. Write the rationale directly to the student in second person: explain why your thinking pattern leads you astray, without narrating answer options.\nQuestion: ${question}\nStudent answer: ${answer}\nTaxonomy:\n${entries}\nReturn only the required structured result.`;
}

export function lessonPrompt(name: string, description: string) {
  return `Write a roughly three-minute middle-school fractions lesson targeting this misconception: ${name} — ${description}. Name the misconception, show a counterexample that breaks it, and finish with exactly two practice questions. Use concise Markdown and return only the required structured result.`;
}
