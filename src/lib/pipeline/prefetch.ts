import { getDb } from "../db";
import type { Locale } from "../locale";
import { selectNextConcept, type ConceptSelection } from "./selection";
import { generateValidatedQuestion } from "./questions";
import type { TaxonomyEntry } from "./evaluation";
import type { GeneratedQuestion } from "./schemas";

type PrefetchedQuestion = { concept: ConceptSelection; question: GeneratedQuestion };
type CacheEntry = {
  questionNumber: number;
  locale: Locale;
  expiresAt: number;
  promise: Promise<PrefetchedQuestion | null>;
};

const CACHE_TTL_MS = 10 * 60_000;
const globalPrefetch = globalThis as typeof globalThis & { questionPrefetch?: Map<number, CacheEntry> };
const cache = globalPrefetch.questionPrefetch ??= new Map<number, CacheEntry>();

export function startQuestionPrefetch(sessionId: number, studentId: number, questionNumber: number, locale: Locale) {
  if (questionNumber > 6) return;
  const promise = generateNextQuestion(studentId, questionNumber, locale, "prefetch").catch(() => null);
  const entry = { questionNumber, locale, expiresAt: Date.now() + CACHE_TTL_MS, promise };
  cache.set(sessionId, entry);
  void promise.then((result) => {
    if (!result && cache.get(sessionId) === entry) cache.delete(sessionId);
  });
}

export async function takePrefetchedQuestion(sessionId: number, questionNumber: number, locale: Locale) {
  const entry = cache.get(sessionId);
  if (!entry || entry.questionNumber !== questionNumber || entry.locale !== locale || entry.expiresAt < Date.now()) {
    if (entry) cache.delete(sessionId);
    return null;
  }
  cache.delete(sessionId);
  return entry.promise;
}

export async function generateNextQuestion(studentId: number, questionNumber: number, locale: Locale, delivery: "interactive" | "prefetch" = "interactive"): Promise<PrefetchedQuestion> {
  const db = getDb();
  const concept = selectNextConcept(db, studentId);
  const taxonomy = db.prepare("SELECT slug, name, description FROM misconceptions WHERE concept_id = ?").all(concept.id) as TaxonomyEntry[];
  const question = await generateValidatedQuestion(concept.name, taxonomy, questionNumber === 6, locale, { delivery });
  return { concept, question };
}
