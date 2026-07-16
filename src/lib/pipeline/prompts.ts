import type { TaxonomyEntry } from "./evaluation";
import { languageInstruction, type Locale } from "../locale";

export function questionPrompt(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, retry: boolean, locale: Locale) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n") || "none";
  const contract = freeResponse || taxonomy.length === 0 ? "Use null for every misconception_slug." : "You MUST engineer at least one incorrect distractor around one provided misconception and tag it with that exact slug. Other distractors may use null. The correct answer MUST use null.";
  const correction = retry ? "Your previous result violated the generation contract. Correct every violation now. " : "";
  return `${correction}Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. ${languageInstruction(locale, "the question prompt, choices, answer, and explanation")} ${contract} Never invent, modify, or reuse a slug outside this taxonomy:\n${entries}\nUse plain text math everywhere: write fractions as 3/4 and multiplication as × or the word times. Do not use LaTeX, backslash commands, or math delimiters. Return only the required structured result.`;
}

export function evaluationPrompt(question: string, answer: string, taxonomy: TaxonomyEntry[], locale: Locale) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n");
  return `Analyze the student's thinking. ${languageInstruction(locale, "the rationale and follow-up probe")} First match it against the provided taxonomy by meaning, using matched_slug when any entry fits. Propose a new misconception only when no taxonomy entry fits. Write the rationale directly to the student in second person: explain why your thinking pattern leads you astray, without narrating answer options. In the rationale, use plain text math: write fractions as 3/4 and multiplication as × or the word times; do not use LaTeX, backslash commands, or math delimiters.\nQuestion: ${question}\nStudent answer: ${answer}\nTaxonomy:\n${entries}\nReturn only the required structured result.`;
}

export function lessonPrompt(name: string, description: string, locale: Locale) {
  return `Write a roughly three-minute middle-school fractions lesson targeting this misconception: ${name} — ${description}. ${languageInstruction(locale, "the lesson title and content")} Name the misconception, show a counterexample that breaks it, and finish with exactly two practice questions. Use concise Markdown but plain text math only: write fractions as 3/4 and multiplication as × or the word times; do not use LaTeX, backslash commands, or math delimiters. Return only the required structured result.`;
}
