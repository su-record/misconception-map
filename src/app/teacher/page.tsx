import { MisconceptionGraph } from "@/components/map/MisconceptionGraph";
import { Sparkline } from "@/components/Sparkline";
import { getDb } from "@/lib/db";
import { getClassMap, getConceptMastery, getMisconceptionRanking } from "@/lib/teacher-data";

export const dynamic = "force-dynamic";

export default function TeacherPage() {
  const db = getDb();
  const rankings = getMisconceptionRanking(db);
  const mastery = getConceptMastery(db);
  return <main className="mx-auto max-w-7xl px-6 py-10"><p className="text-sm font-semibold text-teal-700">Class intelligence</p><h1 className="text-3xl font-bold">Where the class needs you next</h1><div className="mt-8 grid gap-6 md:grid-cols-3"><Metric label="Students" value="8" /><Metric label="Active patterns" value={String(rankings.length)} /><Metric label="Average mastery" value={`${Math.round(100 * mastery.reduce((sum, item) => sum + item.average, 0) / mastery.length)}%`} /></div><section className="mt-8 overflow-hidden rounded-3xl border bg-white"><div className="border-b p-6"><h2 className="text-xl font-bold">Misconceptions to address</h2><p className="text-sm text-slate-500">Ranked by students affected × average strength</p></div><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Pattern</th><th className="p-4">Concept</th><th className="p-4">Students</th><th className="p-4">Strength</th><th className="p-4">Priority</th></tr></thead><tbody>{rankings.map((item, index) => <tr className="border-t" key={item.id}><td className="p-4 font-medium"><span className="mr-3 text-slate-400">{index + 1}</span>{item.name}</td><td className="p-4 text-slate-600">{item.concept}</td><td className="p-4">{item.affected}</td><td className="p-4">{Math.round(item.averageStrength * 100)}%</td><td className="p-4 font-semibold text-rose-600">{item.score.toFixed(1)}</td></tr>)}</tbody></table></section><section className="mt-8 rounded-3xl border bg-white p-6"><h2 className="text-xl font-bold">Mastery by concept</h2><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{mastery.map((item) => <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3" key={item.id}><div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-slate-500">{Math.round(item.average * 100)}% class average</p></div><Sparkline values={item.values} /></div>)}</div></section><section className="mt-8"><h2 className="mb-4 text-xl font-bold">Merged class map</h2><MisconceptionGraph data={getClassMap(db)} /></section></main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-950 p-6 text-white"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}
