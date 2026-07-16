import type { AnswerEvaluation, GeneratedQuestion } from "./schemas";
import type { Locale } from "../locale";

export type TaxonomyEntry = { slug: string; name: string; description: string };

export function evaluateKnownChoice(question: GeneratedQuestion, answer: string, taxonomy: TaxonomyEntry[], locale: Locale = "en"): AnswerEvaluation | null {
  if (question.type !== "multiple_choice") return null;
  const choice = question.choices.find((item) => item.label === answer || item.text === answer);
  if (!choice) return null;
  if (choice.label === question.correct_answer) return correctEvaluation(question.explanation, locale);
  if (!choice.misconception_slug) return null;
  const misconception = taxonomy.find((item) => item.slug === choice.misconception_slug);
  return {
    is_correct: false,
    misconception: { matched_slug: choice.misconception_slug, proposed_new: null },
    rationale: misconceptionRationale(misconception, locale),
    followup_probe: null,
  };
}

function correctEvaluation(explanation: string, locale: Locale): AnswerEvaluation {
  const lead = { en: "You used the fraction relationship correctly.", ko: "분수의 관계를 올바르게 사용했어요.", ja: "分数の関係を正しく使えました。" }[locale];
  return {
    is_correct: true,
    misconception: null,
    rationale: `${lead} ${explanation}`,
    followup_probe: null,
  };
}

function misconceptionRationale(entry: TaxonomyEntry | undefined, locale: Locale) {
  const name = entry?.name ?? "familiar shortcut";
  if (locale === "ko") return `“${name}” 사고 패턴을 사용하고 있지만, 이 지름길은 분수의 값과 연산 사이의 관계를 무시하기 때문에 잘못된 결론으로 이어져요.`;
  if (locale === "ja") return `「${name}」という考え方を使っていますが、この近道は分数の値と演算の関係を無視するため、誤った結論につながります。`;
  return `You’re using the “${name}” thinking pattern, but it leads you astray because this shortcut ignores how the fraction values and operations relate.`;
}
