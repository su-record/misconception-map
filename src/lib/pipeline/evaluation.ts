import type { AnswerEvaluation, GeneratedQuestion } from "./schemas";

export type TaxonomyEntry = { slug: string; name: string; description: string };

export function evaluateKnownChoice(question: GeneratedQuestion, answer: string, taxonomy: TaxonomyEntry[]): AnswerEvaluation | null {
  if (question.type !== "multiple_choice") return null;
  const choice = question.choices.find((item) => item.label === answer || item.text === answer);
  if (!choice) return null;
  if (choice.label === question.correct_answer) return correctEvaluation(question.explanation);
  if (!choice.misconception_slug) return null;
  const misconception = taxonomy.find((item) => item.slug === choice.misconception_slug);
  return {
    is_correct: false,
    misconception: { matched_slug: choice.misconception_slug, proposed_new: null },
    rationale: misconceptionRationale(misconception),
    followup_probe: null,
  };
}

function correctEvaluation(explanation: string): AnswerEvaluation {
  return {
    is_correct: true,
    misconception: null,
    rationale: `You used the fraction relationship correctly. ${explanation}`,
    followup_probe: null,
  };
}

function misconceptionRationale(entry?: TaxonomyEntry) {
  if (!entry) return "You’re using a familiar shortcut, but it leads you astray because it ignores how the fraction values relate.";
  return `You’re using the “${entry.name}” thinking pattern, but it leads you astray because this shortcut ignores how the fraction values and operations relate.`;
}
