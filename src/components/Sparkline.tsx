export function Sparkline({ values }: { values: number[] }) {
  const points = values.map((value, index) => `${index * (100 / Math.max(1, values.length - 1))},${28 - value * 24}`).join(" ");
  return <svg aria-label="Student mastery distribution" className="h-8 w-28" viewBox="0 0 100 32"><defs><filter id="spark-glow"><feGaussianBlur result="blur" stdDeviation="2" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs><polyline fill="none" filter="url(#spark-glow)" points={points} stroke="#5eead4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>;
}
