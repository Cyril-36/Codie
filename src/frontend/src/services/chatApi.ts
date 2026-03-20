import client from "./client";

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const { data } = await client.post<ChatResponse>("/api/v1/chat", request);
  return data;
}
