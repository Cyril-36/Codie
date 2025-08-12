import { motion } from "framer-motion";
import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";

import { ScoreDisplay } from "../components/Analysis/ScoreDisplay";
import { SuggestionCard } from "../components/Analysis/SuggestionCard";
import UploadArea from "../components/CodeEditor/UploadArea";
import { PageTransition, LoadingOverlay } from "../components/Transitions/PageTransition";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import { useResponsive } from "../hooks/useResponsive";
import { useScreenReaderAnnouncement, ariaPatterns } from "../hooks/useScreenReader";
import { analyzeSnippet, analyzeFile, type AnalyzeResponse } from "../services/api";

const CodeEditor = React.lazy(() => import("../components/CodeEditor"));
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];
const sampleCode = {
  python: `def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
# Example usage
result = fibonacci(10)
print(f"The 10th Fibonacci number is: {result}")`,
  javascript: `function fibonacci(n) {
    // Calculate the nth Fibonacci number
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}
// Example usage
const result = fibonacci(10);
`,
  java: `public class Fibonacci {
    public static int fibonacci(int n) {
        // Calculate the nth Fibonacci number
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
    public static void main(String[] args) {
        int result = fibonacci(10);
        System.out.println("The 10th Fibonacci number is: " + result);
    }
}`,
};
export default function Home() {
  // State management
  const [language, setLanguage] = useState<keyof typeof sampleCode>("python");
  const [code, setCode] = useState<string>(sampleCode.python);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  // Hooks
  const { isMobile, isTablet } = useResponsive();
  const { announce } = useScreenReaderAnnouncement();
  const navigate = useNavigate();
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as keyof typeof sampleCode;
    setLanguage(lang);
    setCode(sampleCode[lang]);
    setResult(null);
    setError(null);
  };
  const handleAnalyze = async () => {
    if (!code.trim()) {
      const errorMessage = "Please enter code to analyze";
      setError(errorMessage);
      announce(errorMessage, "assertive");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Analyzing code...");
    try {
      const data = await analyzeSnippet(language, code, showAll);
      setResult(data);
      announce(`Analysis completed. Found ${data.suggestions.length} suggestions with complexity score ${data.complexity}`);
    } catch (e: any) {
      const errorMessage = e?.message || "Request failed";
      setError(errorMessage);
      announce(`Analysis failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };
  // Enhanced file upload with new upload area
  const handleFileSelect = (files: File[]) => {
    // Removed unused uploadedFiles state update
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };
  const handleFileContent = (content: string, filename: string, detectedLanguage: string) => {
    setCode(content);
    // Update language if detected language is supported
    if (detectedLanguage in sampleCode) {
      setLanguage(detectedLanguage as keyof typeof sampleCode);
    }
    announce(`File ${filename} loaded successfully`);
  };
  const handleFileUpload = async (file: File) => {
    if (file.size > 16 * 1024) { // 16KB limit
      setError("File too large. Maximum size is 16KB.");
      announce("File upload failed: File too large", "assertive");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Analyzing uploaded file...");
    try {
      const data = await analyzeFile(file, language, showAll);
      setResult(data);
      announce("File analysis completed successfully");
      // Read file content to display in editor
      const text = await file.text();
      setCode(text);
    } catch (e: any) {
      const errorMessage = e?.message || "File upload failed";
      setError(errorMessage);
      announce(`Analysis failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };
  const goToTestGen = () => {
    const params = new URLSearchParams({ language: String(language), code });
    navigate(`/test-gen?${params.toString()}`);
  };
  const goToPerf = () => {
    const params = new URLSearchParams({ language: String(language), code });
    navigate(`/performance?${params.toString()}`);
  };
  return (
    <PageTransition type="fade">
      <div className="space-y-6">
        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={loading}
          message="Analyzing your code..."
          type="spinner"
        />
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            {...ariaPatterns.navigation("Code Analysis")}
          >
            Code Analysis
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Analyze your code for complexity, get AI suggestions, and improve code quality
          </p>
        </motion.div>
        {/* Main Content Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-fit">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Code Input
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select
                    label="Language"
                    options={languageOptions}
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    isLanguageSelector={true}
                    {...ariaPatterns.textbox("Programming language selection")}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant={uploadMode ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setUploadMode(!uploadMode)}
                      {...ariaPatterns.button(`Switch to ${uploadMode ? "code editor" : "file upload"} mode`)}
                    >
                      {uploadMode ? "Code Editor" : "File Upload"}
                    </Button>
                  </div>
                </div>
                {uploadMode ? (
                  <UploadArea
                    onFileSelect={handleFileSelect}
                    onFileContent={handleFileContent}
                    acceptedTypes={['.py', '.js', '.java', '.ts', '.jsx', '.tsx', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs']}
                    maxFileSize={16} // 16KB
                    maxFiles={1}
                    allowMultiple={false}
                    className="min-h-[200px]"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code
                    </label>
                    <Suspense
                      fallback={
                        <textarea
                          className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                     dark:bg-gray-700 dark:text-gray-100 font-mono text-sm resize-none"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          aria-label="Code editor"
                          placeholder="Enter your code here..."
                        />
                      }
                    >
                      <CodeEditor language={language} value={code} onChange={setCode} />
                    </Suspense>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showAll}
                      onChange={(e) => setShowAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus-primary"
                      {...ariaPatterns.textbox("Show all suggestions toggle")}
                    />
                    Show all suggestions
                  </label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={goToTestGen}>
                      Generate tests from this
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToPerf}>
                      Run performance on this
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleAnalyze}
                  loading={loading}
                  disabled={!code.trim()}
                  fullWidth
                  className="btn-hover"
                  {...ariaPatterns.button("Analyze code")}
                >
                  Analyze Code
                </Button>
              </div>
            </Card>
          </motion.div>
          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="h-fit">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Analysis Results
              </h2>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4"
                >
                  <Alert variant="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </motion.div>
              )}
              {result ? (
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Score Display */}
                  <div className="flex justify-center">
                    <ScoreDisplay
                      score={result.complexity}
                      size="large"
                      animated={true}
                      showTooltip={true}
                      tooltipContent={`Complexity Score: ${result.complexity}/100`}
                    />
                  </div>
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg card-hover"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {result.suggestions.length}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Suggestions</div>
                    </motion.div>
                    <motion.div
                      className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg card-hover"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {String(language).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Language</div>
                    </motion.div>
                  </div>
                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                        AI Suggestions ({result.suggestions.length})
                      </h3>
                      <motion.div
                        className="space-y-3"
                        variants={{
                          initial: { opacity: 0, x: -20 },
                          animate: {
                            transition: {
                              staggerChildren: 0.1,
                            },
                          }}}
                        initial="initial"
                        animate="animate"
                      >
                        {result.suggestions.map((suggestion, index) => (
                          <motion.div
                            key={index}
                            variants={{
                              initial: { opacity: 0, x: -20 },
                              animate: { opacity: 1, x: 0 },
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <SuggestionCard
                              suggestion={{
                                message: suggestion.message,
                                confidence: suggestion.confidence,
                                severity: suggestion.confidence > 0.8 ? 'high' : suggestion.confidence > 0.5 ? 'medium' : 'low',
                                code: code.split('\n')[index] || '',
                                line: index + 1,
                              }}
                              index={index}
                              onApplyFix={() => {
                                announce(`Applied suggestion: ${suggestion.message}`);
                              }}
                              className="card-hover"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  )}
                  {/* Analysis Metadata */}
                  {result.id && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Analysis ID: {result.id}</span>
                        <span>{result.created_at}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-12 text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.svg
                    className="w-12 h-12 mx-auto mb-4 opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2z" />
                  </motion.svg>
                  <p className="text-lg font-medium mb-2">Ready to analyze</p>
                  <p className="text-sm">Upload a file or enter code to get started</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
