import client from "./client";

export interface RefactorSuggestion {
  file: string;
  type: string;
  description: string;
  priority: string;
  impact?: string;
  codeSpans?: Array<{
    line: number;
    column: number;
    length: number;
    code: string;
  }>;
  diff?: {
    before: string;
    after: string;
    hunks: Array<{
      oldStart: number;
      oldLines: number;
      newStart: number;
      newLines: number;
      lines: string[];
    }>;
  };
  estimatedEffort?: string;
  riskLevel?: "low" | "medium" | "high";
  dependencies?: string[];
}

export interface RefactorResponse {
  suggestions: RefactorSuggestion[];
  metrics: {
    complexity: number;
    maintainability: number;
    testability: number;
  };
}

export async function getRefactorPlan(): Promise<RefactorResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await client.get<any>("/api/v1/refactor-plan");

  // Normalize backend response: backend returns { generated_at, suggestions: [{id, file, reason, impact_score, actions}] }
  // Frontend expects: { metrics: {complexity, maintainability, testability}, suggestions: [{type, priority, description, ...}] }
  const rawSuggestions: Array<{
    id?: string;
    file?: string;
    reason?: string;
    description?: string;
    impact_score?: number;
    actions?: string[];
    type?: string;
    priority?: string;
  }> = data?.suggestions ?? [];

  const suggestions: RefactorSuggestion[] = rawSuggestions.map((s) => {
    const impact_score = typeof s.impact_score === "number" ? s.impact_score : 0;
    const priority =
      s.priority ??
      (impact_score >= 0.7 ? "high" : impact_score >= 0.4 ? "medium" : "low");
    return {
      file: s.file ?? "",
      type: s.type ?? s.actions?.[0] ?? "refactor",
      description: s.description ?? s.reason ?? "",
      priority,
      dependencies:
        s.actions && s.actions.length > 1 ? s.actions.slice(1) : undefined,
    };
  });

  const metrics: RefactorResponse["metrics"] = data?.metrics ?? {
    complexity: 0,
    maintainability: 0,
    testability: 0,
  };

  return { suggestions, metrics };
}
