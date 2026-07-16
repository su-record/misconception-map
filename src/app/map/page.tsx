import { MisconceptionGraph } from "@/components/map/MisconceptionGraph";
import { getDb } from "@/lib/db";
import { getStudentMap } from "@/lib/map-data";

export const dynamic = "force-dynamic";

export default async function MapPage({ searchParams }: { searchParams: Promise<{ studentId?: string }> }) {
  const studentId = Number((await searchParams).studentId ?? 1);
  const db = getDb();
  const students = db.prepare("SELECT id, name FROM students ORDER BY id").all() as { id: number; name: string }[];
  return <main className="mx-auto max-w-7xl px-6 py-10"><div className="mb-7 flex items-end justify-between"><div><p className="text-sm font-semibold text-teal-700">Personal learning graph</p><h1 className="text-3xl font-bold">Your misconception map</h1><p className="mt-2 text-slate-600">Blue-green concepts show mastery. Red nodes show thinking patterns to work on.</p></div><form><select className="rounded-lg border bg-white p-2" defaultValue={studentId} name="studentId">{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select><button className="ml-2 rounded-lg bg-slate-900 px-3 py-2 text-white">View</button></form></div><MisconceptionGraph data={getStudentMap(db, studentId)} /></main>;
}
