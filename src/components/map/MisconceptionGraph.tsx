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
  return <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="overflow-hidden rounded-3xl border bg-white"><svg className="h-[620px] w-full" ref={svgRef} viewBox="0 0 800 620" /></div><Detail node={selected} /></div>;
}

function drawGraph(svgElement: SVGSVGElement | null, data: MapData, select: (node: MapNode) => void) {
  if (!svgElement) return;
  const svg = d3.select(svgElement); svg.selectAll("*").remove();
  const nodes: SimNode[] = data.nodes.map((node) => ({ ...node }));
  const links: SimLink[] = data.links.map((link) => ({ ...link }));
  const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink<SimNode, SimLink>(links).id((node) => node.id).distance(95)).force("charge", d3.forceManyBody().strength(-260)).force("center", d3.forceCenter(400, 310));
  const line = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", "#cbd5e1").attr("stroke-width", 1.5);
  const node = svg.append("g").selectAll("g").data(nodes).join("g").attr("class", "cursor-pointer").on("click", (_, item) => select(item));
  node.append("circle").attr("r", radius).attr("fill", color).attr("stroke", "white").attr("stroke-width", 3);
  node.append("text").text((item) => item.name).attr("text-anchor", "middle").attr("dy", (item) => radius(item) + 15).attr("font-size", 10).attr("fill", "#334155");
  simulation.on("tick", () => { line.attr("x1", (item) => position(item.source, "x")).attr("y1", (item) => position(item.source, "y")).attr("x2", (item) => position(item.target, "x")).attr("y2", (item) => position(item.target, "y")); node.attr("transform", (item) => `translate(${item.x ?? 0},${item.y ?? 0})`); });
  return () => { simulation.stop(); };
}

function position(node: string | number | SimNode, axis: "x" | "y") { return typeof node === "object" ? node[axis] ?? 0 : 0; }
function radius(node: MapNode) { return node.kind === "concept" ? 13 : 8 + (node.strength ?? 0) * 15; }
function color(node: MapNode) { return node.kind === "misconception" ? "#ef4444" : d3.interpolateRgb("#2dd4bf", "#2563eb")(node.mastery ?? 0); }

function Detail({ node }: { node?: MapNode }) {
  if (!node) return <aside className="rounded-3xl border bg-white p-6 text-slate-500">Select a node to see its learning evidence.</aside>;
  return <aside className="rounded-3xl border bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{node.kind}</p><h2 className="mt-2 text-xl font-bold">{node.name}</h2><p className="mt-3 text-sm text-slate-600">{node.description}</p><div className="mt-5 h-2 overflow-hidden rounded bg-slate-100"><div className={node.kind === "concept" ? "h-full bg-blue-600" : "h-full bg-red-500"} style={{ width: `${100 * (node.mastery ?? node.strength ?? 0)}%` }} /></div>{node.evidence?.length ? <div className="mt-6"><h3 className="font-semibold">Evidence answers</h3>{node.evidence.map((item, index) => <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm" key={index}>{item}</p>)}</div> : null}{node.lesson ? <p className="mt-5 rounded-lg bg-teal-50 p-3 text-sm">Related lesson: {node.lesson}</p> : null}</aside>;
}
