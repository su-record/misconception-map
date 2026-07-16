export type MapNode = {
  id: string;
  kind: "concept" | "misconception";
  name: string;
  description: string;
  mastery?: number;
  strength?: number;
  evidence?: string[];
  lesson?: string | null;
};

export type MapLink = { source: string; target: string };
export type MapData = { nodes: MapNode[]; links: MapLink[] };
