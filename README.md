# Misconception Map

> An AI tutor that turns students' wrong answers into a living map of misconceptions — and teaches to fix them.

Built for **OpenAI Build Week 2026** (Education track) with **Codex + GPT-5.6**.

## What it does

- **Students** take a short daily diagnostic conversation. Wrong answers aren't just marked incorrect — GPT-5.6 extracts the *underlying misconception* and stores it as a node in a per-student knowledge graph.
- **Next-day micro-lessons** are generated from the graph, targeting the weakest concept — not a generic curriculum.
- **Teachers** get a class-wide misconception dashboard: "14 of 23 students share the same misconception about X."

## Stack (planned)

- Next.js 15 + TypeScript + Tailwind, D3 force-directed graph
- PostgreSQL + Apache AGE (graph) + pgvector (similarity)
- GPT-5.6 structured outputs for misconception extraction & lesson generation
- Built end-to-end with Codex

## Development

_TBD — setup instructions will land here with the first working version._
