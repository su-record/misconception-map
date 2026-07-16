# Misconception Map

Misconception Map is an AI fractions tutor that turns wrong answers into a living learning graph. Students get targeted daily practice and micro-lessons; teachers see shared misconception patterns across the class.

## Judge setup

Requirements: Node.js 20+ and an optional OpenAI API key.

```bash
npm install
npm run seed
OPENAI_API_KEY=your_key npm run dev
```

Open [http://localhost:3000/learn](http://localhost:3000/learn). OpenAI SDK 6 uses the native-fetch Responses API with Zod-backed structured outputs: interactive questions and evaluations run on `gpt-5.6-terra` with `xhigh` reasoning, while micro-lessons use high-reasoning `gpt-5.6` for quality. Transient API connection failures are retried once within bounded request timeouts.

No API key is required for the complete demo path:

```bash
npm install
npm run seed
npm run dev
```

Without `OPENAI_API_KEY`, recorded question, evaluation, and micro-lesson fixtures pass through the same schemas and persistence paths. Seed data includes 15 middle-school fraction concepts, 15 classic misconceptions, 8 students, and historical answer evidence.

For a public single-process demo, enable the read-only seeded roster mode:

```bash
DEMO_MODE=1 OPENAI_API_KEY=your_key npm run dev
```

Live-key API requests are limited to 30 per IP and 300 globally per rolling hour. `DEMO_MODE` exposes only the existing seeded roster; there is no web seed or roster-mutation endpoint. Seeding remains a local CLI operation.

## Demo routes

- `/learn` — six-question student session with immediate feedback and a targeted micro-lesson
- `/map` — interactive personal D3 misconception map with evidence details
- `/teacher` — ranked class patterns, mastery sparklines, and merged class graph

Use the student picker to switch profiles. Run `npm run seed` at any time to restore deterministic sample data.

## Verification

```bash
npm run build
npm test
```

Data is stored locally in `data/mismap.db` using plain SQL migrations. No external database, authentication, or deployment service is required.
