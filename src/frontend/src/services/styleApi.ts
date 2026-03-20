import client from "./client";

export interface StyleRequest {
  language: string;
  snippet: string;
}

export interface StyleIssue {
  line: number;
  message: string;
  severity: string;
  rule?: string;
}

export interface StyleResponse {
  style: Record<string, unknown>;
  issues: StyleIssue[];
  score: number;
}

export async function checkStyle(
  request: StyleRequest
): Promise<StyleResponse> {
  const { data } = await client.post<StyleResponse>("/api/v1/style", request);
  return data;
}
