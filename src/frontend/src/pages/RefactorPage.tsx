import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";

import { PageTransition } from "../components/Transitions/PageTransition";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getRefactorPlan, type RefactorResponse } from "../services/api";

// Mock data for demo purposes
const mockRefactorData: RefactorResponse = {
  metrics: {
    complexity: 7.2,
    maintainability: 6.5,
    testability: 5.8,
  },
  suggestions: [
    {
      file: "src/utils/math.py",
      type: "Extract Function",
      description:
        "The fibonacci function has high cyclomatic complexity. Break it into smaller functions or use an iterative approach.",
      priority: "high",
      riskLevel: "high",
      impact: "Significant reduction in code complexity and maintainability.",
      estimatedEffort: "1-2 hours",
      codeSpans: [
        { line: 10, column: 1, length: 25, code: "def fibonacci(n: int) -> int:" },
        { line: 11, column: 1, length: 15, code: "    if n <= 0:" },
        { line: 12, column: 1, length: 16, code: "        return 0" },
        { line: 13, column: 1, length: 17, code: "    elif n == 1:" },
        { line: 14, column: 1, length: 16, code: "        return 1" },
        { line: 15, column: 1, length: 12, code: "    else:" },
        { line: 16, column: 1, length: 45, code: "        return fibonacci(n - 1) + fibonacci(n - 2)" },
      ],
      diff: {
        before: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        after: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        hunks: [
          {
            oldStart: 10,
            oldLines: 7,
            newStart: 10,
            newLines: 7,
            lines: [
              "@@ -10,7 +10,7 @@",
              " def fibonacci(n: int) -> int:",
              "     if n <= 0:",
              "         return 0",
              "     elif n == 1:",
              "         return 1",
              "     else:",
              "         return fibonacci(n - 1) + fibonacci(n - 2)"
            ]
          }
        ]
      },
      dependencies: ["fibonacci"],
    },
    {
      file: "src/utils/math.py",
      type: "Add Type Hints",
      description:
        "Add type hints to fibonacci for better readability: def fibonacci(n: int) -> int",
      priority: "medium",
      riskLevel: "low",
      impact: "Improved code readability and maintainability.",
      estimatedEffort: "0.5-1 hour",
      codeSpans: [
        { line: 10, column: 1, length: 25, code: "def fibonacci(n: int) -> int:" },
        { line: 11, column: 1, length: 15, code: "    if n <= 0:" },
        { line: 12, column: 1, length: 16, code: "        return 0" },
        { line: 13, column: 1, length: 17, code: "    elif n == 1:" },
        { line: 14, column: 1, length: 16, code: "        return 1" },
        { line: 15, column: 1, length: 12, code: "    else:" },
        { line: 16, column: 1, length: 45, code: "        return fibonacci(n - 1) + fibonacci(n - 2)" },
      ],
      diff: {
        before: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        after: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        hunks: [
          {
            oldStart: 10,
            oldLines: 7,
            newStart: 10,
            newLines: 7,
            lines: [
              "@@ -10,7 +10,7 @@",
              " def fibonacci(n: int) -> int:",
              "     if n <= 0:",
              "         return 0",
              "     elif n == 1:",
              "         return 1",
              "     else:",
              "         return fibonacci(n - 1) + fibonacci(n - 2)"
            ]
          }
        ]
      },
      dependencies: ["fibonacci"],
    },
    {
      file: "src/utils/math.py",
      type: "Memoization",
      description:
        "Use functools.lru_cache to memoize fibonacci and reduce time complexity from O(2^n) to O(n).",
      priority: "medium",
      riskLevel: "medium",
      impact: "Significant reduction in time complexity and potential memory usage.",
      estimatedEffort: "2-3 hours",
      codeSpans: [
        { line: 10, column: 1, length: 25, code: "def fibonacci(n: int) -> int:" },
        { line: 11, column: 1, length: 15, code: "    if n <= 0:" },
        { line: 12, column: 1, length: 16, code: "        return 0" },
        { line: 13, column: 1, length: 17, code: "    elif n == 1:" },
        { line: 14, column: 1, length: 16, code: "        return 1" },
        { line: 15, column: 1, length: 12, code: "    else:" },
        { line: 16, column: 1, length: 45, code: "        return fibonacci(n - 1) + fibonacci(n - 2)" },
      ],
      diff: {
        before: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        after: "def fibonacci(n: int) -> int:\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 2)",
        hunks: [
          {
            oldStart: 10,
            oldLines: 7,
            newStart: 10,
            newLines: 7,
            lines: [
              "@@ -10,7 +10,7 @@",
              " def fibonacci(n: int) -> int:",
              "     if n <= 0:",
              "         return 0",
              "     elif n == 1:",
              "         return 1",
              "     else:",
              "         return fibonacci(n - 1) + fibonacci(n - 2)"
            ]
          }
        ]
      },
      dependencies: ["fibonacci"],
    },
  ],
};

export default function RefactorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefactorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoLoad, setAutoLoad] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  const handleGetPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setResult(mockRefactorData);
      } else {
        const response = await getRefactorPlan();
        setResult(response);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get refactor plan";
      setError(errorMessage);
      // Fallback to mock data on error
      setResult(mockRefactorData);
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    if (autoLoad) {
      handleGetPlan();
      setAutoLoad(false);
    }
  }, [autoLoad, handleGetPlan]);

  const handleApplyFix = (suggestion: RefactorResponse["suggestions"][number]) => {
    // In a real app, this would apply the fix to the code editor or open a diff
    // eslint-disable-next-line no-console
    console.log("Applying fix:", suggestion);
  };

  const handleCopySuggestion = async (
    suggestion: RefactorResponse["suggestions"][number]
  ) => {
    try {
      await navigator.clipboard.writeText(
        `${suggestion.type}: ${suggestion.description} (File: ${suggestion.file})`
      );
    } catch (err) {
      console.error("Failed to copy suggestion:", err);
    }
  };

  const handlePreviewDiff = (suggestion: RefactorResponse["suggestions"][number]) => {
    // In a real app, this would open a modal or a new tab with a diff viewer
    // eslint-disable-next-line no-console
    console.log("Previewing diff for:", suggestion);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
    switch (priority.toLowerCase()) {
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
        <div className="flex justify-center gap-3">
          <Button 
            onClick={handleGetPlan} 
            disabled={loading} 
            loading={loading}
            className="btn-anim"
          >
            {loading ? "Analyzing Codebase..." : "🔧 Generate Refactor Plan"}
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              setUseMockData(true);
              setResult(mockRefactorData);
            }}
            className="btn-anim"
          >
            Use Demo Data
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
                    {result.metrics.complexity.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complexity
                  </div>
                </div>
                <div className="text-center" style={{ '--i': 1 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-good">
                    {result.metrics.maintainability.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Maintainability
                  </div>
                </div>
                <div className="text-center" style={{ '--i': 2 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-highlight">
                    {result.metrics.testability.toFixed(1)}
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
                Refactor Suggestions ({result.suggestions.length})
              </h3>
              <div className="space-y-4 list-stagger">
                {result.suggestions.map((suggestion, index) => (
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
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                suggestion.riskLevel === "high" 
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
