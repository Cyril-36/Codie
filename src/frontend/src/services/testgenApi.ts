import client from "./client";

export interface TestGenRequest {
  language: string;
  file?: string;
  code: string;
  function?: string;
}

export interface TestGenResponse {
  tests: string;
  framework: string;
  coverage: number;
}

export async function generateTests(
  request: TestGenRequest
): Promise<TestGenResponse> {
  const { data } = await client.post<TestGenResponse>(
    "/api/v1/generate-tests",
    request
  );
  return data;
}
