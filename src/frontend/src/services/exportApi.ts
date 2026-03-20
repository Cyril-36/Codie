import client from "./client";

export async function exportData(
  format: "csv" | "json" | "md" | "pdf"
): Promise<Blob> {
  const { data } = await client.get(`/api/v1/export/${format}`, {
    responseType: "blob",
  });
  return data;
}
