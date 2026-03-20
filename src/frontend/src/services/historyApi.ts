import client from "./client";

export interface HistoryItem {
  id: number;
  language: string;
  complexity: number;
  created_at: string;
  filename?: string;
  analysis_type?: string;
  score?: number;
  suggestion_count?: number;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  size: number;
}

export interface HistoryStats {
  total_analyses: number;
  languages: Record<string, number>;
  average_complexity: number;
  analysis_types: Record<string, number>;
  last_analysis: string | null;
}

export async function fetchHistory(
  page = 1,
  size = 10,
  language?: string,
  analysisType?: string
): Promise<HistoryResponse> {
  const params: Record<string, unknown> = { page, size };
  if (language) params.language = language;
  if (analysisType) params.analysis_type = analysisType;
  const { data } = await client.get<HistoryResponse>("/api/v1/history", {
    params,
  });
  return data;
}

export async function getHistoryStats(): Promise<HistoryStats> {
  const { data } = await client.get<HistoryStats>("/api/v1/history/stats");
  return data;
}

export async function getHistoryItem(id: number): Promise<HistoryItem> {
  const { data } = await client.get<HistoryItem>(`/api/v1/history/${id}`);
  return data;
}

export async function deleteHistoryItem(
  id: number
): Promise<{ message: string; deleted_id: number }> {
  const { data } = await client.delete<{ message: string; deleted_id: number }>(
    `/api/v1/history/${id}`
  );
  return data;
}

export async function clearHistory(): Promise<{
  message: string;
  cleared_count: number;
}> {
  const { data } = await client.delete<{
    message: string;
    cleared_count: number;
  }>("/api/v1/history");
  return data;
}
