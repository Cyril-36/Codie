import type { AnalyzeResponse } from './api';

const base = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";
export type AnalyzeRequest = {
  language: "python" | "javascript" | "java";
  code: string;
};
export async function analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${base}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  return (await res.json()) as AnalyzeResponse;
}
export async function exportMarkdown(): Promise<Blob> {
  const res = await fetch(`${base}/api/v1/export/md`);
  if (!res.ok) throw new Error("Export MD failed");
  return await res.blob();
}
export async function exportPdf(): Promise<Blob> {
  const res = await fetch(`${base}/api/v1/export/pdf`);
  if (!res.ok) throw new Error("Export PDF failed");
  return await res.blob();
}
