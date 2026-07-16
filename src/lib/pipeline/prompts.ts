export function questionPrompt(concept: string, misconceptions: string[], freeResponse: boolean) {
  return `Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. Engineer distractors around: ${misconceptions.join(", ") || "common errors"}. Return only the required structured result.`;
}

export function evaluationPrompt(question: string, answer: string, taxonomy: string[]) {
  return `Analyze this answer, then match a misconception from the taxonomy. Propose a new one only if none match. Question: ${question}\nAnswer: ${answer}\nTaxonomy: ${taxonomy.join(", ")}. Return only the required structured result.`;
}

export function lessonPrompt(name: string, description: string) {
  return `Write a roughly three-minute middle-school fractions lesson targeting this misconception: ${name} — ${description}. Name the misconception, show a counterexample that breaks it, and finish with exactly two practice questions. Use concise Markdown and return only the required structured result.`;
}
