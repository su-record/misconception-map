# SPEC — Misconception Map (OpenAI Build Week MVP)

> An AI tutor that turns students' wrong answers into a living knowledge graph of
> misconceptions, generates next-day micro-lessons targeting the weakest concepts,
> and gives teachers a class-wide misconception dashboard.
> **Deadline: submit by 2026-07-21 5PM PT. Scope is 5 days. Cut ruthlessly.**

## 0. Hard constraints

- **Model: `gpt-5.6` via OpenAI API** (env `OPENAI_API_KEY`). Every LLM call uses
  structured outputs (JSON schema). No other providers.
- Judges must be able to run this with: `npm install && npm run seed && npm run dev`
  plus a single `OPENAI_API_KEY` env var. **Zero external services** — SQLite on disk.
- All UI text in English. Code comments minimal, English.
- Demo must work with seeded sample data even with no API key (recorded fixtures
  fallback), because judges may not set a key.

## 1. Stack (decided — do not relitigate)

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- SQLite via better-sqlite3 (file: `data/mismap.db`), schema in plain SQL migrations
- D3 force-directed graph for map visualization (client component)
- Vitest for tests
- OpenAI SDK, model `gpt-5.6`, structured outputs via zod schemas

## 2. Domain model (SQLite tables)

- `concepts` — id, slug, name, description. Seed: **middle-school fractions taxonomy**
  (~15 concepts: equivalence, common denominators, multiplication effect,
  division-by-fraction, mixed numbers, ...).
- `concept_edges` — prerequisite DAG: (from_id, to_id).
- `misconceptions` — id, concept_id, slug, name, description. Seed ~12 classic ones
  (e.g. "multiplication always makes bigger", "divide by fraction makes smaller",
  "add numerators and denominators straight across").
- `students` — id, name. Seed 8 demo students.
- `student_concept` — (student_id, concept_id, mastery REAL 0..1).
- `student_misconception` — (student_id, misconception_id, strength REAL 0..1,
  evidence_count, last_seen_at). **This is the map.**
- `sessions` — id, student_id, started_at, completed_at.
- `answers` — id, session_id, concept_id, question JSON, student_answer,
  is_correct, extracted_misconception_id NULL, rationale.
- `lessons` — id, student_id, target JSON (concept+misconception), content_md,
  created_at, completed_at NULL.

## 3. Core pipeline (the whole point — get this right first)

1. **Question selection**: pick concept with lowest mastery (or weakest prerequisite
   of a failing concept). GPT-5.6 generates one question (multiple choice with
   distractors engineered around known misconceptions + one free-response per session).
2. **Answer evaluation** (GPT-5.6, structured output):
   `{is_correct, misconception: {matched_slug | proposed_new: {name, description}} | null, rationale, followup_probe?}`
   Two-step: (a) analyze the wrong answer, (b) match against the misconception
   taxonomy for that concept; only propose a new misconception if nothing matches.
3. **Graph update**: wrong+matched → strength += evidence-weighted bump; correct on
   related concept → strength decays, mastery rises. Pure TypeScript function,
   fully unit-tested, no LLM.
4. **Micro-lesson generation**: for the strongest misconception, GPT-5.6 writes a
   ~3-minute lesson in Markdown: name the misconception, show a counterexample that
   breaks it, 2 practice questions. Stored in `lessons`.

## 4. Screens (3 routes, no auth — student picker instead)

- `/learn` — chat-style daily session: 6 questions, one at a time, immediate
  feedback, ends with "your map got updated" summary + today's micro-lesson.
- `/map` — the student's misconception map: D3 force graph. Concept nodes colored
  by mastery (teal→blue), misconception nodes red with size = strength, edges to
  their concepts. Click node → detail panel (evidence answers, related lesson).
- `/teacher` — class dashboard: table of misconceptions ranked by
  (# students affected × avg strength), sparkline of class mastery per concept,
  and a merged class-level graph. **The money screen for the demo video.**

## 5. Milestones (work in order; commit after each; STOP if gates fail)

- **M1**: scaffold + migrations + seed script (concepts/misconceptions/students +
  pre-baked answer history so /teacher looks alive immediately). Gate: build green,
  seed produces queryable db.
- **M2**: pipeline steps 1–3 with recorded-fixture fallback; unit tests for graph
  update math + extraction schema parsing. Gate: vitest green without API key.
- **M3**: /learn end-to-end against live gpt-5.6.
- **M4**: /map D3 visualization.
- **M5**: /teacher dashboard.
- **M6**: micro-lessons + polish + README (setup, sample data, judge instructions).

## 6. Gates (run before every commit)

```bash
npm run build && npm test
```

## 7. Out of scope (do NOT build)

Auth, multi-class, multi-subject UI, spaced repetition, LMS integration, i18n,
mobile app, streaming UI, deployment config (handled separately).
