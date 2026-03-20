import client from "./client";

export interface HealthResponse {
  ok: boolean;
  build: string;
  ts: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await client.get<HealthResponse>("/api/v1/health");
  return data;
}
