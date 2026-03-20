import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";

import { PageTransition } from "../components/Transitions/PageTransition";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useToasts } from "../components/ui/ToastProvider";
import { getRefactorPlan, type RefactorResponse } from "../services/refactorApi";

export default function RefactorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefactorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoLoad, setAutoLoad] = useState(true);
  const { show } = useToasts();

  const handleGetPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRefactorPlan();
      setResult(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get refactor plan";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      handleGetPlan();
      setAutoLoad(false);
    }
  }, [autoLoad, handleGetPlan]);

  const handleApplyFix = async (suggestion: RefactorResponse["suggestions"][number]) => {
    try {
      await navigator.clipboard.writeText(
        `${suggestion.type}: ${suggestion.description} (File: ${suggestion.file})`
      );
      show({ message: 'Fix details copied to clipboard', variant: 'success' });
    } catch {
      show({ message: 'Could not copy to clipboard', variant: 'error' });
    }
  };

  const handleCopySuggestion = async (
    suggestion: RefactorResponse["suggestions"][number]
  ) => {
    try {
      await navigator.clipboard.writeText(
        `${suggestion.type}: ${suggestion.description} (File: ${suggestion.file})`
      );
      show({ message: 'Copied to clipboard', variant: 'success' });
    } catch {
      show({ message: 'Could not copy to clipboard', variant: 'error' });
    }
  };

  const handlePreviewDiff = async (suggestion: RefactorResponse["suggestions"][number]) => {
    try {
      const diffText = suggestion.diff
        ? `Before:\n${suggestion.diff.before}\n\nAfter:\n${suggestion.diff.after}`
        : `${suggestion.type}: ${suggestion.description}`;
      await navigator.clipboard.writeText(diffText);
      show({ message: 'Diff copied to clipboard', variant: 'success' });
    } catch {
      show({ message: 'Could not copy to clipboard', variant: 'error' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch ((priority ?? "").toLowerCase()) {
      case "high":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "medium":
        return "text-warning bg-warning/10 border-warning/20";
      case "low":
        return "text-good bg-good/10 border-good/20";
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch ((priority ?? "").toLowerCase()) {
      case "high":
        return <span className="text-destructive text-lg">⚠️</span>;
      case "medium":
        return <span className="text-warning text-lg">⚡</span>;
      case "low":
        return <span className="text-good text-lg">💡</span>;
      default:
        return <span className="text-muted-foreground text-lg">🔧</span>;
    }
  };

  return (
    <PageTransition type="fade">
      <div className="refactor-page space-y-6 page-enter">
        {/* Header Section */}
        <div className="text-center fade-in">
          <nav aria-label="Refactor Plan" className="mb-2">
            <h1 className="text-2xl font-bold text-foreground">
              Refactor Plan
            </h1>
          </nav>
          <p className="refactor-subtext text-muted-foreground">
            Get intelligent suggestions to improve your codebase structure and
            maintainability
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleGetPlan}
            disabled={loading}
            loading={loading}
            className="btn-anim"
          >
            {loading ? "Analyzing Codebase..." : "🔧 Generate Refactor Plan"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/10 fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-lg">❌</span>
              <span>Error: {error}</span>
            </div>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6 fade-in">
            {/* Metrics Overview */}
            <Card className="card-elevate fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Code Quality Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 list-stagger">
                <div className="text-center" style={{ '--i': 0 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-primary">
                    {result?.metrics?.complexity ? result.metrics.complexity.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complexity
                  </div>
                </div>
                <div className="text-center" style={{ '--i': 1 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-good">
                    {result?.metrics?.maintainability ? result.metrics.maintainability.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Maintainability
                  </div>
                </div>
                <div className="text-center" style={{ '--i': 2 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-highlight">
                    {result?.metrics?.testability ? result.metrics.testability.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Testability
                  </div>
                </div>
              </div>
            </Card>

            {/* Refactor Suggestions */}
            <Card className="card-elevate fade-in">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Refactor Suggestions ({result?.suggestions?.length || 0})
              </h3>
              <div className="space-y-4 list-stagger">
                {result?.suggestions?.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion.file}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-border rounded-lg p-4 card-elevate"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(suggestion.priority)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">
                            {suggestion.type}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                              suggestion.priority
                            )}`}
                          >
                            {suggestion.priority.toUpperCase()}
                          </span>
                          {suggestion.riskLevel && (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${suggestion.riskLevel === "high"
                                  ? "text-destructive bg-destructive/10 border-destructive/20"
                                  : suggestion.riskLevel === "medium"
                                    ? "text-warning bg-warning/10 border-warning/20"
                                    : "text-good bg-good/10 border-good/20"
                                }`}
                            >
                              Risk: {suggestion.riskLevel.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>File:</strong> {suggestion.file}
                        </p>
                        <p className="text-sm text-foreground mb-3">
                          {suggestion.description}
                        </p>

                        {/* Enhanced Information */}
                        {suggestion.impact && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Impact:</strong> {suggestion.impact}
                          </p>
                        )}

                        {suggestion.estimatedEffort && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Estimated Effort:</strong> {suggestion.estimatedEffort}
                          </p>
                        )}

                        {/* Code Spans */}
                        {suggestion.codeSpans && suggestion.codeSpans.length > 0 && (
                          <details className="mb-3">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                              View Code Spans ({suggestion.codeSpans.length})
                            </summary>
                            <div className="mt-2 space-y-2">
                              {suggestion.codeSpans.map((span, i) => (
                                <div key={i} className="bg-muted p-2 rounded text-xs font-mono">
                                  <div className="text-muted-foreground mb-1">
                                    Line {span.line}, Column {span.column}
                                  </div>
                                  <pre className="whitespace-pre-wrap">{span.code}</pre>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}

                        {/* Diff Preview */}
                        {suggestion.diff && (
                          <details className="mb-3">
                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                              View Diff Preview
                            </summary>
                            <div className="mt-2 bg-muted p-3 rounded">
                              <div className="text-xs text-muted-foreground mb-2">Before:</div>
                              <pre className="text-xs bg-red-50 dark:bg-red-950/20 p-2 rounded mb-2 overflow-x-auto">
                                {suggestion.diff.before}
                              </pre>
                              <div className="text-xs text-muted-foreground mb-2">After:</div>
                              <pre className="text-xs bg-green-50 dark:bg-green-950/20 p-2 rounded overflow-x-auto">
                                {suggestion.diff.after}
                              </pre>
                            </div>
                          </details>
                        )}

                        {/* Dependencies */}
                        {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">
                              <strong>Dependencies:</strong>
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.dependencies.map((dep, i) => (
                                <Badge key={i} variant="default" className="text-xs">
                                  {dep}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopySuggestion(suggestion)}
                            className="btn-anim"
                          >
                            Copy
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApplyFix(suggestion)}
                            className="btn-anim"
                          >
                            Apply Fix
                          </Button>
                          {suggestion.diff && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewDiff(suggestion)}
                              className="btn-anim"
                            >
                              Preview Diff
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && !result && (
          <Card className="card-elevate fade-in">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">
                Analyzing your codebase and generating refactor suggestions...
              </p>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
