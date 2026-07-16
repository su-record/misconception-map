export function Sparkline({ values }: { values: number[] }) {
  const points = values.map((value, index) => `${index * (100 / Math.max(1, values.length - 1))},${28 - value * 24}`).join(" ");
  return <svg aria-label="Student mastery distribution" className="h-8 w-28" viewBox="0 0 100 32"><polyline fill="none" points={points} stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>;
}
