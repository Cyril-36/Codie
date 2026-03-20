import client from "./client";

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
}

export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>("/api/v1/auth/register", {
    email,
    username,
    password,
  });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>("/api/v1/auth/login", {
    email,
    password,
  });
  return data;
}

export async function refresh(): Promise<TokenRefreshResponse> {
  const { data } = await client.post<TokenRefreshResponse>(
    "/api/v1/auth/refresh"
  );
  return data;
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await client.get<UserResponse>("/api/v1/auth/me");
  return data;
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await client.post<{ message: string }>(
    "/api/v1/auth/logout"
  );
  return data;
}
