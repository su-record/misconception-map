import { MisconceptionGraph } from "@/components/map/MisconceptionGraph";
import { Sparkline } from "@/components/Sparkline";
import { getDb } from "@/lib/db";
import { getClassMap, getConceptMastery, getMisconceptionRanking } from "@/lib/teacher-data";

export const dynamic = "force-dynamic";

export default function TeacherPage() {
  const db = getDb();
  const rankings = getMisconceptionRanking(db);
  const mastery = getConceptMastery(db);
  const average = Math.round(100 * mastery.reduce((sum, item) => sum + item.average, 0) / mastery.length);
  return <main className="mx-auto max-w-[1400px] px-8 py-14"><header><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">Class intelligence</p><h1 className="text-4xl font-black tracking-[-0.04em] text-white">Where the class needs you next</h1><p className="mt-3 max-w-2xl text-slate-400">Turn patterns across student thinking into a focused plan for tomorrow.</p></header><div className="mt-10 grid gap-5 md:grid-cols-3"><Metric accent="teal" label="Students" note="Active this week" value="8" /><Metric accent="coral" label="Active patterns" note="Across the class" value={String(rankings.length)} /><Metric accent="mint" label="Average mastery" note="All fraction concepts" value={`${average}%`} /></div><RankingTable rankings={rankings} /><section className="mt-8 rounded-[28px] border border-white/[0.08] bg-[#111A2E] p-7"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Concept pulse</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">Mastery by concept</h2></div><div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{mastery.map((item) => <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0D1628] p-4" key={item.id}><div><p className="text-sm font-bold text-slate-200">{item.name}</p><p className="mt-1 text-xs text-slate-500"><span className="font-bold text-emerald-200">{Math.round(item.average * 100)}%</span> class average</p></div><Sparkline values={item.values} /></div>)}</div></section><section className="mt-12"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Shared structure</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">Merged class map</h2><p className="mt-2 text-sm text-slate-400">The strongest shared patterns rise to the surface.</p></div><MisconceptionGraph data={getClassMap(db)} /></section></main>;
}

type Ranking = ReturnType<typeof getMisconceptionRanking>[number];

function RankingTable({ rankings }: { rankings: Ranking[] }) {
  return <section className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111A2E]"><div className="flex items-end justify-between border-b border-white/[0.07] p-7"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-300">Priority queue</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">Misconceptions to address</h2></div><p className="text-xs font-medium text-slate-500">Students affected × average strength</p></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-white/[0.025] text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500"><tr><th className="px-7 py-4">Pattern</th><th className="px-5 py-4">Concept</th><th className="px-5 py-4">Students</th><th className="px-5 py-4">Strength</th><th className="px-7 py-4 text-right">Priority</th></tr></thead><tbody>{rankings.map((item, index) => <tr className="border-t border-white/[0.055] text-sm hover:bg-white/[0.025]" key={item.id}><td className="px-7 py-5 font-bold text-slate-100"><span className="mr-4 inline-grid h-7 w-7 place-items-center rounded-lg bg-rose-400/10 text-xs text-rose-300">{index + 1}</span>{item.name}</td><td className="px-5 py-5 text-slate-400">{item.concept}</td><td className="px-5 py-5 font-semibold text-slate-300">{item.affected}</td><td className="px-5 py-5 text-slate-300">{Math.round(item.averageStrength * 100)}%</td><td className="px-7 py-5 text-right text-lg font-black tabular-nums text-rose-300">{item.score.toFixed(1)}</td></tr>)}</tbody></table></div></section>;
}

function Metric({ accent, label, note, value }: { accent: "teal" | "coral" | "mint"; label: string; note: string; value: string }) {
  const colors = { teal: "bg-teal-300", coral: "bg-rose-400", mint: "bg-emerald-200" };
  return <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111A2E] p-6"><span className={`absolute left-0 top-6 h-12 w-1 rounded-r-full ${colors[accent]}`} /><p className="text-sm font-semibold text-slate-400">{label}</p><p className="mt-3 text-4xl font-black tracking-tight text-white">{value}</p><p className="mt-2 text-xs font-medium text-slate-600">{note}</p></div>;
}
