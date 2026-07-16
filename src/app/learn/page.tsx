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
    setBusy(true); setSession(undefined); setComplete(false); setNumber(1); setFeedback(undefined); setLesson(undefined);
    setSession(await fetch(`/api/session?studentId=${id}`).then((response) => response.json()) as SessionData);
    setBusy(false);
  }

  async function submit() {
    if (!session || !answer.trim()) return;
    setBusy(true); setFeedback(undefined);
    const result = await fetch("/api/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session.sessionId, studentId, conceptId: session.concept.id, question: session.question, answer, questionNumber: number }) }).then((response) => response.json()) as { evaluation: AnswerEvaluation; complete: boolean; concept?: SessionData["concept"]; question?: GeneratedQuestion; lesson?: MicroLesson };
    setFeedback(result.evaluation); setComplete(result.complete); setLesson(result.lesson); setAnswer("");
    if (result.concept && result.question) setSession({ ...session, concept: result.concept, question: result.question });
    setNumber((value) => value + 1); setBusy(false);
  }

  return <main className="mx-auto max-w-4xl px-8 py-14"><PageHeader session={session} studentId={studentId} onStudentChange={setStudentId} />{complete ? <Summary lesson={lesson} onRestart={() => void start(studentId)} /> : !session ? <QuestionSkeleton /> : <QuestionCard answer={answer} busy={busy} feedback={feedback} number={number} onAnswer={setAnswer} onSubmit={() => void submit()} session={session} />}</main>;
}

function PageHeader({ session, studentId, onStudentChange }: { session?: SessionData; studentId: number; onStudentChange: (id: number) => void }) {
  return <div className="mb-10 flex items-end justify-between"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Daily practice</p><h1 className="text-4xl font-black tracking-[-0.04em] text-white">Learn from your thinking</h1><p className="mt-3 text-slate-400">Every answer makes your learning map more precise.</p></div><select className="rounded-xl border border-white/10 bg-[#111A2E] px-4 py-3 text-sm font-semibold text-slate-200" value={studentId} onChange={(event) => onStudentChange(Number(event.target.value))}>{session?.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></div>;
}

function QuestionCard({ answer, busy, feedback, number, onAnswer, onSubmit, session }: { answer: string; busy: boolean; feedback?: AnswerEvaluation; number: number; onAnswer: (value: string) => void; onSubmit: () => void; session: SessionData }) {
  return <section className="rounded-[28px] border border-white/[0.08] bg-[#111A2E] p-9 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"><Progress current={Math.min(number, 6)} /><div className="mt-8 flex items-center gap-3"><span className="rounded-full bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-300">{session.concept.name}</span><span className="text-xs font-semibold text-slate-500">Question {Math.min(number, 6)} of 6</span></div><h2 className="mt-5 max-w-3xl text-2xl font-extrabold leading-snug tracking-[-0.02em] text-white">{session.question.prompt}</h2>{busy ? <ThinkingState /> : <><div className="mt-8 space-y-3">{session.question.choices.map((choice) => <button className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left font-medium ${answer === choice.label ? "border-teal-300 bg-teal-300/10 text-white shadow-[0_0_24px_rgba(45,212,191,0.08)]" : "border-white/[0.08] bg-[#0D1628] text-slate-300 hover:border-teal-300/50 hover:bg-teal-300/[0.04]"}`} key={choice.label} onClick={() => onAnswer(choice.label)}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black ${answer === choice.label ? "bg-teal-300 text-[#08131d]" : "bg-white/[0.06] text-slate-400"}`}>{choice.label}</span>{choice.text}</button>)}<textarea className="min-h-24 w-full resize-none rounded-2xl border border-white/[0.08] bg-[#0D1628] p-4 text-slate-100 placeholder:text-slate-600 focus:border-teal-300/60" placeholder="Type your answer or explain your reasoning" value={answer} onChange={(event) => onAnswer(event.target.value)} /></div>{feedback ? <Feedback evaluation={feedback} /> : null}<button className="mt-7 rounded-xl bg-teal-300 px-6 py-3 font-extrabold text-[#08131d] shadow-[0_10px_30px_rgba(45,212,191,0.14)] hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-35" disabled={!answer.trim()} onClick={onSubmit}>Check answer</button></>}</section>;
}

function Progress({ current }: { current: number }) {
  return <div className="flex gap-2" aria-label={`Question ${current} of 6`}>{Array.from({ length: 6 }, (_, index) => <span className={`h-2 rounded-full transition-all ${index + 1 === current ? "w-9 bg-teal-300" : index + 1 < current ? "w-2 bg-emerald-200" : "w-2 bg-white/10"}`} key={index} />)}</div>;
}

function ThinkingState() {
  const messages = ["Analyzing your thinking…", "Tracing the idea behind your answer…", "Updating your learning map…"];
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = setInterval(() => setIndex((value) => (value + 1) % messages.length), 1700); return () => clearInterval(timer); }, [messages.length]);
  return <div className="mt-8 rounded-2xl border border-teal-300/10 bg-teal-300/[0.035] p-6"><div className="space-y-3"><div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" /><div className="h-3 w-1/2 animate-pulse rounded-full bg-white/[0.06]" /></div><p className="mt-6 flex items-center gap-3 text-sm font-semibold text-teal-200"><span className="h-2 w-2 animate-ping rounded-full bg-teal-300" />{messages[index]}</p></div>;
}

function QuestionSkeleton() {
  return <section className="rounded-[28px] border border-white/[0.08] bg-[#111A2E] p-9"><div className="flex gap-2">{Array.from({ length: 6 }, (_, index) => <span className="h-2 w-2 rounded-full bg-white/10" key={index} />)}</div><div className="mt-10 h-5 w-32 animate-pulse rounded-full bg-teal-300/10" /><div className="mt-6 h-7 w-4/5 animate-pulse rounded-lg bg-white/10" /><div className="mt-3 h-7 w-2/3 animate-pulse rounded-lg bg-white/[0.06]" /><ThinkingState /></section>;
}

function Feedback({ evaluation }: { evaluation: AnswerEvaluation }) {
  const slug = evaluation.misconception?.matched_slug;
  if (evaluation.is_correct) return <div className="mt-7 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.07] p-5"><p className="font-extrabold text-emerald-200">Correct — that idea is getting stronger.</p><p className="mt-1 text-sm text-emerald-50/70">{evaluation.rationale}</p></div>;
  return <div className="mt-7 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-5"><span className="inline-flex rounded-full bg-rose-400/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-300">{slug ? slug.replaceAll("-", " ") : "New misconception"}</span><p className="mt-3 text-sm leading-relaxed text-rose-50/75">{evaluation.rationale}</p></div>;
}

function Summary({ lesson, onRestart }: { lesson?: MicroLesson; onRestart: () => void }) {
  return <section className="rounded-[28px] border border-emerald-200/15 bg-[#111A2E] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Session complete</p><h2 className="mt-3 text-4xl font-black tracking-tight text-white">Your map got updated.</h2><p className="mt-4 text-slate-400">Six pieces of evidence made your learning map more precise. Here is today&apos;s lesson for your strongest pattern.</p>{lesson ? <article className="prose prose-invert mt-8 max-w-none rounded-2xl border border-white/[0.07] bg-[#0D1628] p-8 prose-headings:text-white prose-strong:text-teal-200"><h2>{lesson.title}</h2><ReactMarkdown>{lesson.content_md}</ReactMarkdown></article> : null}<button className="mt-8 rounded-xl bg-teal-300 px-6 py-3 font-extrabold text-[#08131d]" onClick={onRestart}>Practice again</button></section>;
}
