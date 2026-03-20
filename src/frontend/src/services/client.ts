import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── In-memory token store ───────────────────────────────────────────
let accessToken: string | null = null;

export function getToken() {
  return accessToken;
}
export function setToken(token: string | null) {
  accessToken = token;
}
export function clearToken() {
  accessToken = null;
}

// ── Axios instance ──────────────────────────────────────────────────
export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // send HttpOnly refresh cookie
});

// ── Request interceptor: attach Bearer token ────────────────────────
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh for 401s that aren't already retries or auth endpoints
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );
      const newToken: string = data.access_token;
      setToken(newToken);
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return client(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearToken();
      // Redirect to login (only in browser context)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
