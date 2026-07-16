export type GraphState = { mastery: number; misconceptionStrength: number; evidenceCount: number };
export type GraphEvidence = { isCorrect: boolean; matchedMisconception: boolean; confidence?: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function updateGraph(state: GraphState, evidence: GraphEvidence): GraphState {
  const confidence = clamp(evidence.confidence ?? 1);
  if (evidence.isCorrect) {
    return {
      mastery: clamp(state.mastery + 0.12 * confidence),
      misconceptionStrength: clamp(state.misconceptionStrength - 0.16 * confidence),
      evidenceCount: state.evidenceCount,
    };
  }
  return {
    mastery: clamp(state.mastery - 0.08 * confidence),
    misconceptionStrength: evidence.matchedMisconception
      ? clamp(state.misconceptionStrength + 0.22 * confidence)
      : state.misconceptionStrength,
    evidenceCount: state.evidenceCount + (evidence.matchedMisconception ? 1 : 0),
  };
}
