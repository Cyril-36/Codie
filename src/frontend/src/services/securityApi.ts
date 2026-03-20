import client from "./client";

export interface SecurityRequest {
  language: string;
  requirements?: string;
}

export interface Vulnerability {
  package?: string;
  severity: string;
  description: string;
  cve?: string;
  version?: string;
  fixed_in?: string;
  patch?: string;
  references?: string[];
  cve_source?: string;
  version_ranges?: Array<{
    introduced: string;
    fixed: string;
    type: string;
  }>;
  affected_ecosystems?: string[];
  cwe_ids?: string[];
  attack_vector?: string;
  impact?: {
    confidentiality?: string;
    integrity?: string;
    availability?: string;
  };
  published_date?: string;
  last_modified_date?: string;
  // Local code scan fields
  category?: string;
  message?: string;
  line?: number;
  fix_suggestion?: string;
  confidence?: number;
}

export interface SecurityResponse {
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  scanned_packages?: number;
  scan_timestamp: string;
  language: string;
}

export async function scanSecurity(
  request: SecurityRequest
): Promise<SecurityResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await client.post<any>("/api/v1/security", request);

  // Normalize: backend returns "issues" but frontend expects "vulnerabilities"
  const vulnerabilities: Vulnerability[] = data?.vulnerabilities ?? data?.issues ?? [];
  const summary = data?.summary ?? { total: 0, high: 0, medium: 0, low: 0 };

  return {
    ...data,
    vulnerabilities,
    summary,
    scan_timestamp: data?.scan_timestamp ?? new Date().toISOString(),
    language: data?.language ?? request.language,
  };
}
