import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 text-center">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">A living learning profile</p>
      <h1 className="text-5xl font-bold tracking-tight">Every wrong answer tells us what to teach next.</h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">Practice fractions, uncover the thinking behind mistakes, and turn misconceptions into tomorrow&apos;s lesson.</p>
      <Link className="mt-10 inline-block rounded-full bg-slate-950 px-6 py-3 font-medium text-white" href="/learn">Start learning</Link>
    </main>
  );
}
