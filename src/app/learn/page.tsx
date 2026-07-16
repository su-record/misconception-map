"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { AnswerEvaluation, GeneratedQuestion, MicroLesson } from "@/lib/pipeline/schemas";

type Student = { id: number; name: string };
type SessionData = { students: Student[]; sessionId: number; concept: { id: number; name: string }; question: GeneratedQuestion };

export default function LearnPage() {
  const [studentId, setStudentId] = useState(1);
  const [session, setSession] = useState<SessionData>();
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerEvaluation>();
  const [number, setNumber] = useState(1);
  const [complete, setComplete] = useState(false);
  const [lesson, setLesson] = useState<MicroLesson>();
  const [busy, setBusy] = useState(false);
  useEffect(() => { void start(studentId); }, [studentId]);

  async function start(id: number) {
    setBusy(true); setComplete(false); setNumber(1); setFeedback(undefined); setLesson(undefined);
    setSession(await fetch(`/api/session?studentId=${id}`).then((response) => response.json()) as SessionData);
    setBusy(false);
  }

  async function submit() {
    if (!session || !answer.trim()) return;
    setBusy(true);
    const result = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.sessionId, studentId, conceptId: session.concept.id, question: session.question, answer, questionNumber: number }) }).then((response) => response.json()) as { evaluation: AnswerEvaluation; complete: boolean; concept?: SessionData["concept"]; question?: GeneratedQuestion; lesson?: MicroLesson };
    setFeedback(result.evaluation); setComplete(result.complete); setLesson(result.lesson); setAnswer("");
    if (result.concept && result.question) setSession({ ...session, concept: result.concept, question: result.question });
    setNumber((value) => value + 1); setBusy(false);
  }

  return <main className="mx-auto max-w-3xl px-6 py-12">
    <div className="mb-8 flex items-center justify-between"><div><p className="text-sm text-teal-700">Daily practice</p><h1 className="text-3xl font-bold">Learn from your thinking</h1></div><select className="rounded-lg border bg-white p-2" value={studentId} onChange={(event) => setStudentId(Number(event.target.value))}>{session?.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></div>
    {complete ? <Summary lesson={lesson} onRestart={() => void start(studentId)} /> : <section className="rounded-3xl border bg-white p-8 shadow-sm"><p className="text-sm font-medium text-slate-500">Question {number} of 6 · {session?.concept.name}</p><h2 className="mt-4 text-xl font-semibold">{busy && !session ? "Preparing your question…" : session?.question.prompt}</h2><div className="mt-6 space-y-3">{session?.question.choices.map((choice) => <button className="block w-full rounded-xl border p-3 text-left hover:border-teal-500" key={choice.label} onClick={() => setAnswer(choice.label)}>{choice.label}. {choice.text}</button>)}<textarea className="w-full rounded-xl border p-3" placeholder="Type your answer or explain your reasoning" value={answer} onChange={(event) => setAnswer(event.target.value)} /></div>{feedback && <div className={`mt-6 rounded-xl p-4 ${feedback.is_correct ? "bg-teal-50" : "bg-rose-50"}`}><p className="font-semibold">{feedback.is_correct ? "That’s right." : "Here’s what your answer tells us."}</p><p className="mt-1 text-sm">{feedback.rationale}</p></div>}<button className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-white disabled:opacity-40" disabled={busy || !answer.trim()} onClick={() => void submit()}>{busy ? "Thinking…" : feedback ? "Continue" : "Check answer"}</button></section>}
  </main>;
}

function Summary({ lesson, onRestart }: { lesson?: MicroLesson; onRestart: () => void }) {
  return <section className="rounded-3xl bg-slate-950 p-10 text-white"><p className="text-teal-300">Session complete</p><h2 className="mt-2 text-3xl font-bold">Your map got updated.</h2><p className="mt-3 text-slate-300">Six pieces of evidence made your learning map more precise. Here is today&apos;s lesson for your strongest pattern.</p>{lesson ? <article className="prose prose-slate mt-8 max-w-none rounded-2xl bg-white p-7 text-slate-900"><h2>{lesson.title}</h2><ReactMarkdown>{lesson.content_md}</ReactMarkdown></article> : null}<button className="mt-7 rounded-full bg-white px-5 py-2.5 text-slate-950" onClick={onRestart}>Practice again</button></section>;
}
