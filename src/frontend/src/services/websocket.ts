export type ChatMessage = {
  type: "hello" | "reply" | "diff" | "error";
  text?: string;
  unified?: string;
};
export type ChatRequest = {
  type: "ask" | "diff";
  text?: string;
  file?: string;
  before?: string;
  after?: string;
};
export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  constructor(baseUrl?: string) {
    const wsUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    this.url = wsUrl.replace(/^http/, "ws") + "/ws/chat";
  }
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };
        this.ws.onerror = (error) => {
          reject(error);
        };
        this.ws.onclose = () => {
          this.handleReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
  onMessage(callback: (message: ChatMessage) => void) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as ChatMessage;
          callback(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
    }
  }
  sendMessage(request: ChatRequest) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(request));
    } else {
      throw new Error("WebSocket is not connected");
    }
  }
  ask(question: string) {
    this.sendMessage({ type: "ask", text: question });
  }
  diff(file: string, before: string, after: string) {
    this.sendMessage({ type: "diff", file, before, after });
  }
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
