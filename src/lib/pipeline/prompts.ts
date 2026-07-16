import type { TaxonomyEntry } from "./evaluation";
import { languageInstruction, languageName, type Locale } from "../locale";

export function questionPrompt(concept: string, taxonomy: TaxonomyEntry[], freeResponse: boolean, retry: boolean, locale: Locale) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n") || "none";
  const contract = freeResponse || taxonomy.length === 0 ? "Use null for every misconception_slug." : "You MUST engineer at least one incorrect distractor around one provided misconception and tag it with that exact slug. Other distractors may use null. The correct answer MUST use null.";
  const correction = retry ? "Your previous result violated the generation contract. Correct every violation now. " : "";
  return `${correction}Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. ${languageInstruction(locale, "the question prompt, choice texts, and explanation")} ${contract} Never invent, modify, or reuse a slug outside this taxonomy:\n${entries}\nUse plain text math everywhere: write fractions as 3/4 and multiplication as × or the word times. Do not use LaTeX, backslash commands, or math delimiters. Return only the required structured result.`;
}

export function diagnosisPrompt(question: string, answer: string, locale: Locale) {
  return `Diagnose whether the student's answer is correct and explain their thinking. ${languageInstruction(locale, "the rationale and follow-up probe")} Write directly to the student in second person: explain why your thinking pattern succeeds or leads you astray, without narrating answer options. Do not classify or name a taxonomy misconception. Use plain text math: write fractions as 3/4 and multiplication as × or the word times; do not use LaTeX, backslash commands, or math delimiters.\nQuestion: ${question}\nStudent answer: ${answer}\nReturn only is_correct, rationale, and followup_probe in the required structured result.`;
}

export function taxonomyMatchPrompt(question: string, answer: string, taxonomy: TaxonomyEntry[], locale: Locale) {
  const entries = taxonomy.map((item) => `${item.slug}: ${item.name} — ${item.description}`).join("\n") || "none";
  return `Match the student's thinking to this English taxonomy. The student's content is natively in ${languageName(locale)}. Use an exact provided slug when any description fits by meaning. Return matched_slug as null and propose a new English misconception only when nothing fits. Never invent or modify a slug. Do not write a rationale.\nQuestion: ${question}\nStudent answer: ${answer}\nTaxonomy:\n${entries}\nReturn only matched_slug and proposed_new in the required structured result.`;
}

export function lessonPrompt(name: string, description: string, locale: Locale) {
  return `Write a roughly three-minute middle-school fractions lesson targeting this misconception: ${name} — ${description}. ${languageInstruction(locale, "the lesson title and content")} Name the misconception, show a counterexample that breaks it, and finish with exactly two practice questions. Use concise Markdown but plain text math only: write fractions as 3/4 and multiplication as × or the word times; do not use LaTeX, backslash commands, or math delimiters. Return only the required structured result.`;
}
