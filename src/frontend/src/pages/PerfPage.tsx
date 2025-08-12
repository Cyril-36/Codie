import { motion } from "framer-motion";
import React, { useState, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ScoreDisplay } from "../components/Analysis/ScoreDisplay";
import { PageTransition, LoadingOverlay } from "../components/Transitions/PageTransition";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { CircularProgress } from "../components/ui/ProgressBar";
import Select from "../components/ui/Select";
import { useReducedMotion } from "../hooks/useAnimations";
import { useResponsive } from "../hooks/useResponsive";
import { useScreenReaderAnnouncement, ariaPatterns } from "../hooks/useScreenReader";
import { runPerformanceAnalysis, type PerfRequest, type PerfResponse } from "../services/api";
import { formatMemoryMB } from "../utils/formatters";
import { assertFormatted } from "../utils/formatters";

const CodeEditor = React.lazy(() => import("../components/CodeEditor"));
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];
const sampleCode = {
  python: `import time
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
# Performance test
data = [random.randint(1, 1000) for _ in range(100)]
start_time = time.time()
sorted_data = quick_sort(data.copy())
end_time = time.time()
print(f"Quick sort took: {end_time - start_time:.4f} seconds")`,
  javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}
// Performance test
const data = Array.from({length: 100}, () => Math.floor(Math.random() * 1000));
const startTime = performance.now();
const sortedData = quickSort([...data]);
const endTime = performance.now();
`,
  java: `import java.util.*;
public class PerformanceTest {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] < arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1);
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
    public static void main(String[] args) {
        int[] data = new int[100];
        Random rand = new Random();
        for (int i = 0; i < data.length; i++) {
            data[i] = rand.nextInt(1000);
        }
        long startTime = System.nanoTime();
        quickSort(data, 0, data.length - 1);
        long endTime = System.nanoTime();
        System.out.println("Quick sort took: " + (endTime - startTime) / 1000000.0 + " ms");
    }
}`,
};
export default function PerfPage() {
  // State management
  const [language, setLanguage] = useState<keyof typeof sampleCode>("python");
  const [code, setCode] = useState(sampleCode.python);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PerfResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializedFromParams, setInitializedFromParams] = useState(false);
  // Hooks
  const { isMobile } = useResponsive();
  const prefersReducedMotion = useReducedMotion();
  const { announce } = useScreenReaderAnnouncement();
  const location = useLocation();
  useEffect(() => {
    if (initializedFromParams) return;
    const params = new URLSearchParams(location.search);
    const paramLang = params.get("language");
    const paramCode = params.get("code");
    if (paramLang && (paramLang in sampleCode)) {
      setLanguage(paramLang as keyof typeof sampleCode);
    }
    if (paramCode) {
      setCode(paramCode);
      setTimeout(() => {
        handleAnalyze(paramLang && (paramLang in sampleCode) ? (paramLang as keyof typeof sampleCode) : language, paramCode);
      }, 0);
    }
    setInitializedFromParams(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, initializedFromParams]);
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as keyof typeof sampleCode;
    setLanguage(lang);
    setCode(sampleCode[lang]);
    setResult(null);
    setError(null);
    announce(`Language changed to ${newLanguage}`);
  };
  const handleAnalyze = async (
    langOverride?: keyof typeof sampleCode,
    codeOverride?: string
  ) => {
    const effectiveLanguage = langOverride ?? language;
    const effectiveCode = codeOverride ?? code;
    if (!effectiveCode.trim()) {
      const errorMessage = "Please enter code to analyze";
      setError(errorMessage);
      announce(errorMessage, "assertive");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Running performance analysis...");
    try {
      const request: PerfRequest = {
        language: effectiveLanguage,
        code: effectiveCode.trim(),
      };
      const response = await runPerformanceAnalysis(request);
      setResult(response);
      const rating = getPerformanceRating(response.execution_time);
      announce(
        `Performance analysis completed. Execution time: ${formatTime(response.execution_time)}, Rating: ${rating.label}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to run performance analysis";
      setError(errorMessage);
      announce(`Performance analysis failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };
  const formatTime = (time: number) => {
    if (time < 1) return `${(time * 1000).toFixed(2)} ms`;
    return `${time.toFixed(3)} s`;
  };
  // Keep legacy formatter for bytes for any future use, but tiles and details use MB/GB only
  const formatMemoryBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const _formatMemoryBytes = formatMemoryBytes; // Keep for potential future use
  const getPerformanceRating = (time: number) => {
    if (time < 0.1) return { label: "Excellent", variant: "success" as const };
    if (time < 1) return { label: "Good", variant: "info" as const };
    if (time < 5) return { label: "Fair", variant: "warning" as const };
    return { label: "Slow", variant: "error" as const };
  };
  // Calculate performance score (0-100) based on execution time
  const getPerformanceScore = (time: number) => {
    if (time < 0.01) return 100;
    if (time < 0.1) return 90;
    if (time < 0.5) return 80;
    if (time < 1) return 70;
    if (time < 2) return 60;
    if (time < 5) return 50;
    if (time < 10) return 40;
    return Math.max(10, 40 - Math.floor(time));
  };
  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={loading}
          message="Running performance analysis..."
          type="spinner"
        />
        {/* Header Section */}
        <motion.div
          className="fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          <h1
            className="text-3xl font-bold text-foreground"
            {...ariaPatterns.navigation("Performance Analysis")}
          >
            Performance Analysis
          </h1>
          <p className="mt-2 text-muted-foreground">
            Analyze the execution time and memory usage of your code
          </p>
        </motion.div>
        {/* Main Content Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Input Section */}
          <motion.div
            className="fade-in"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.1 }}
          >
            <Card className="card-elevate fade-in h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Code to Analyze
              </h2>
              <div className="space-y-4">
                <Select
                  label="Language"
                  options={languageOptions}
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  isLanguageSelector={true}
                  {...ariaPatterns.textbox("Programming language selection")}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Code
                  </label>
                  <Suspense
                    fallback={
                      <textarea
                        className="w-full h-80 px-3 py-2 border border-border rounded-md shadow-sm
                                   focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
                                   bg-input text-foreground font-mono text-sm resize-none input-focus-anim"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        aria-label="Code editor"
                        placeholder="Enter your code here..."
                      />
                    }
                  >
                    <CodeEditor
                      language={language}
                      value={code}
                      onChange={setCode}
                    />
                  </Suspense>
                </div>
                <Button
                  onClick={() => handleAnalyze()}
                  loading={loading}
                  disabled={!code.trim()}
                  fullWidth
                  className="btn-anim"
                  {...ariaPatterns.button("Run performance analysis")}
                >
                  Run Performance Analysis
                </Button>
              </div>
            </Card>
          </motion.div>
          {/* Results Section */}
          <motion.div
            className="fade-in"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.2 }}
          >
            <Card className="card-elevate fade-in h-fit" aria-live="polite">
              <h2 className="sticky-subheader text-xl font-semibold text-foreground mb-6">
                Performance Results
              </h2>
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="error-shake fade-in mb-4"
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <Alert variant="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </motion.div>
              )}
              {result ? (
                <motion.div
                  className="space-y-6 fade-in"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                >
                  {/* Performance Score Display */}
                  <div className="flex justify-center">
                    <ScoreDisplay
                      score={getPerformanceScore(result.execution_time)}
                      size="large"
                      animated={!prefersReducedMotion}
                      showTooltip={true}
                      tooltipContent={`Performance Score: ${getPerformanceScore(result.execution_time)}/100`}
                    />
                  </div>
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 list-stagger">
                    <motion.div
                      className="text-center p-4 performance-tile neutral card-elevate"
                      style={{ '--i': 0 } as React.CSSProperties}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    >
                      <div className="text-2xl font-bold text-primary">
                        {(() => { const v = formatTime(result.execution_time); assertFormatted('Execution Time', v); return v; })()}
                      </div>
                      <div className="text-sm text-primary-foreground mb-2">Execution Time</div>
                      <Badge variant={getPerformanceRating(result.execution_time).variant}>
                        {getPerformanceRating(result.execution_time).label}
                      </Badge>
                    </motion.div>
                    <motion.div
                      className="text-center p-4 performance-tile neutral card-elevate"
                      style={{ '--i': 1 } as React.CSSProperties}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    >
                      <div className="text-2xl font-bold text-highlight">
                        {(() => { const v = formatMemoryMB(result.memory_usage); assertFormatted('Memory Usage', v); return v; })()}
                      </div>
                      <div className="text-sm text-highlight-foreground">Memory Usage</div>
                    </motion.div>
                  </div>
                  {/* Progress Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Performance Rating
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getPerformanceScore(result.execution_time)}/100
                      </span>
                    </div>
                    <CircularProgress
                      value={getPerformanceScore(result.execution_time)}
                      max={100}
                      variant="default"
                      size={120}
                      showPercentage={false}
                      className="mb-4"
                    />
                  </div>
                  {/* Output Display */}
                  {result.output && (
                    <div>
                      <h3 className="font-medium text-foreground mb-3">Output</h3>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono max-h-48 border border-border text-foreground">
                        {result.output}
                      </pre>
                    </div>
                  )}
                  {/* Error Display */}
                  {result.error && (
                    <Alert variant="error" title="Execution Error">
                      <pre className="text-sm font-mono whitespace-pre-wrap">{result.error}</pre>
                    </Alert>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-12 text-muted-foreground fade-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                >
                  <motion.svg
                    className="w-12 h-12 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: prefersReducedMotion ? 0 : [0, 5, -5, 0] }}
                    transition={{ duration: prefersReducedMotion ? 0 : 2, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </motion.svg>
                  <p className="text-lg font-medium mb-2">Ready to analyze performance</p>
                  <p className="text-sm">Enter your code and click "Run Performance Analysis" to get started</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
