"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { MapData, MapNode } from "./types";

type SimNode = MapNode & d3.SimulationNodeDatum;
type SimLink = d3.SimulationLinkDatum<SimNode>;

export function MisconceptionGraph({ data }: { data: MapData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<MapNode>();
  useEffect(() => drawGraph(svgRef.current, data, setSelected), [data]);
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"><div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#080F1D] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"><Legend /><svg className="h-[650px] w-full" ref={svgRef} viewBox="0 0 900 650" /></div><Detail node={selected} /></div>;
}

function drawGraph(svgElement: SVGSVGElement | null, data: MapData, select: (node: MapNode) => void) {
  if (!svgElement) return;
  const svg = d3.select(svgElement); svg.selectAll("*").remove();
  const nodes: SimNode[] = data.nodes.map((node) => ({ ...node }));
  const links: SimLink[] = data.links.map((link) => ({ ...link }));
  addGlow(svg);
  const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink<SimNode, SimLink>(links).id((node) => node.id).distance(130)).force("charge", d3.forceManyBody().strength(-480)).force("collide", d3.forceCollide<SimNode>().radius((item) => radius(item) + 22)).force("center", d3.forceCenter(450, 325));
  const line = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", "#26344d").attr("stroke-width", 1.25);
  const node = svg.append("g").selectAll("g").data(nodes).join("g").attr("class", "cursor-pointer").on("click", (_, item) => select(item));
  node.append("circle").attr("r", radius).attr("fill", color).attr("filter", "url(#node-glow)").attr("stroke", (item) => item.kind === "concept" ? "#99f6e4" : "#fecdd3").attr("stroke-width", 1.5);
  node.append("circle").attr("r", (item) => Math.max(3, radius(item) * 0.36)).attr("fill", "rgba(255,255,255,0.35)").attr("transform", "translate(-3,-3)").attr("pointer-events", "none");
  node.append("text").text((item) => item.name).attr("text-anchor", "middle").attr("dy", (item) => radius(item) + 18).attr("font-size", 10).attr("font-weight", 600).attr("fill", "#cbd5e1");
  simulation.on("tick", () => { nodes.forEach(constrain); line.attr("x1", (item) => position(item.source, "x")).attr("y1", (item) => position(item.source, "y")).attr("x2", (item) => position(item.target, "x")).attr("y2", (item) => position(item.target, "y")); node.attr("transform", (item) => `translate(${item.x ?? 0},${item.y ?? 0})`); });
  return () => { simulation.stop(); };
}

function addGlow(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
  const filter = svg.append("defs").append("filter").attr("id", "node-glow").attr("x", "-100%").attr("y", "-100%").attr("width", "300%").attr("height", "300%");
  filter.append("feGaussianBlur").attr("stdDeviation", "5").attr("result", "blur");
  const merge = filter.append("feMerge"); merge.append("feMergeNode").attr("in", "blur"); merge.append("feMergeNode").attr("in", "SourceGraphic");
}

function position(node: string | number | SimNode, axis: "x" | "y") { return typeof node === "object" ? node[axis] ?? 0 : 0; }
function constrain(node: SimNode) { node.x = Math.max(48, Math.min(852, node.x ?? 0)); node.y = Math.max(58, Math.min(582, node.y ?? 0)); }
function radius(node: MapNode) { return node.kind === "concept" ? 14 + (node.mastery ?? 0) * 5 : 9 + (node.strength ?? 0) * 17; }
function color(node: MapNode) { return node.kind === "misconception" ? "#fb7185" : d3.interpolateRgb("#0f766e", "#2dd4bf")(node.mastery ?? 0); }

function Legend() {
  return <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-5 rounded-full border border-white/[0.07] bg-[#111A2E]/85 px-4 py-2.5 text-xs font-semibold text-slate-400 backdrop-blur"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-teal-300 shadow-[0_0_12px_#2dd4bf]" />Concept</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_12px_#fb7185]" />Misconception</span><span>Size = strength</span></div>;
}

function Detail({ node }: { node?: MapNode }) {
  if (!node) return <aside className="rounded-[28px] border border-white/[0.08] bg-[#111A2E] p-7 text-sm leading-relaxed text-slate-500"><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.04] text-xl text-teal-300">↗</div>Select a node to explore its learning evidence, strength, and related lesson.</aside>;
  const misconception = node.kind === "misconception";
  return <aside className="rounded-[28px] border border-white/[0.08] bg-[#111A2E] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.2)]"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${misconception ? "bg-rose-400/15 text-rose-300" : "bg-teal-300/10 text-teal-300"}`}>{node.kind}</span><h2 className="mt-4 text-2xl font-black tracking-tight text-white">{node.name}</h2><p className="mt-3 text-sm leading-relaxed text-slate-400">{node.description}</p><div className="mt-6"><div className="mb-2 flex justify-between text-xs font-bold text-slate-500"><span>{misconception ? "Strength" : "Mastery"}</span><span>{Math.round(100 * (node.mastery ?? node.strength ?? 0))}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${misconception ? "bg-rose-400 shadow-[0_0_12px_#fb7185]" : "bg-teal-300 shadow-[0_0_12px_#2dd4bf]"}`} style={{ width: `${100 * (node.mastery ?? node.strength ?? 0)}%` }} /></div></div>{node.evidence?.length ? <div className="mt-7"><h3 className="text-sm font-extrabold text-slate-200">Evidence answers</h3>{node.evidence.map((item, index) => <p className="mt-3 rounded-xl border border-white/[0.06] bg-[#0D1628] p-4 text-sm leading-relaxed text-slate-400" key={index}>{item}</p>)}</div> : null}{node.lesson ? <p className="mt-6 rounded-xl border border-teal-300/10 bg-teal-300/[0.05] p-4 text-sm text-teal-100/75">Related lesson: {node.lesson}</p> : null}</aside>;
}
