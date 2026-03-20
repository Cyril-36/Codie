import client from "./client";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  complexity: number;
  size: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hotspots: Array<{
    node: string;
    score: number;
    reason: string;
  }>;
  totalComplexity?: number;
  complexityMetrics?: {
    average: number;
    max: number;
    min: number;
    distribution: Array<{
      range: string;
      count: number;
    }>;
  };
}

export async function getCodeGraph(): Promise<GraphResponse> {
  const { data } = await client.get<GraphResponse>("/api/v1/graph");
  return data;
}
