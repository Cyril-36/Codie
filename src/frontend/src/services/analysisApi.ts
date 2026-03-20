import client from "./client";

export interface Suggestion {
  message: string;
  confidence: number;
}

export interface AnalyzeResponse {
  ok: boolean;
  complexity: number;
  suggestions: Suggestion[] | string[];
  metrics?: Record<string, unknown>;
  language?: string;
  timestamp?: string;
  id?: number;
  created_at?: string;
}

export async function analyzeSnippet(
  language: string,
  code: string,
  showAll = false
): Promise<AnalyzeResponse> {
  const { data } = await client.post<AnalyzeResponse>("/api/v1/analyze", {
    language,
    code,
    show_all: showAll,
  });
  return { ...data, ok: true };
}

export async function analyzeFile(
  file: File,
  language: string,
  showAll = false
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  const { data } = await client.post<AnalyzeResponse>(
    "/api/v1/analyze-file",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      params: showAll ? { show_all: true } : {},
    }
  );
  return { ...data, ok: true };
}
