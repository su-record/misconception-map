export function questionPrompt(concept: string, misconceptions: string[], freeResponse: boolean) {
  return `Create one middle-school fractions ${freeResponse ? "free-response" : "multiple-choice"} question about ${concept}. Engineer distractors around: ${misconceptions.join(", ") || "common errors"}. Return only the required structured result.`;
}

export function evaluationPrompt(question: string, answer: string, taxonomy: string[]) {
  return `Analyze this answer, then match a misconception from the taxonomy. Propose a new one only if none match. Question: ${question}\nAnswer: ${answer}\nTaxonomy: ${taxonomy.join(", ")}. Return only the required structured result.`;
}
