import client from "./client";

export interface PerfRequest {
  language: string;
  code?: string;
  cmd?: string[];
}

export interface PerfResponse {
  execution_time: number;
  memory_usage: number;
  output: string;
  error?: string;
}

export async function runPerformanceAnalysis(
  request: PerfRequest
): Promise<PerfResponse> {
  const { data } = await client.post<PerfResponse>("/api/v1/perf", request);
  return data;
}
