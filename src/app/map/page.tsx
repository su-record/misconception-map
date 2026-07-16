import { MisconceptionGraph } from "@/components/map/MisconceptionGraph";
import { getDb } from "@/lib/db";
import { getStudentMap } from "@/lib/map-data";

export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const studentId = Number((await searchParams).studentId ?? 1);
  const db = getDb();
  const students = db.prepare("SELECT id, name FROM students ORDER BY id").all() as { id: number; name: string }[];
  return <main className="mx-auto max-w-[1400px] px-8 py-14"><div className="mb-10 flex items-end justify-between"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Personal learning graph</p><h1 className="text-4xl font-black tracking-[-0.04em] text-white">Your misconception map</h1><p className="mt-3 max-w-2xl text-slate-400">See what you know, spot the patterns holding you back, and watch them fade as your understanding grows.</p></div><form className="flex items-center rounded-2xl border border-white/[0.08] bg-[#111A2E] p-1.5"><select className="rounded-xl bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200" defaultValue={studentId} name="studentId">{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select><button className="rounded-xl bg-teal-300 px-4 py-2.5 text-sm font-extrabold text-[#08131d]">View map</button></form></div><MisconceptionGraph data={getStudentMap(db, studentId)} /></main>;
}
