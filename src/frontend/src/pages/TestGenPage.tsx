import { motion } from "framer-motion";
import React, { useState, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { PageTransition } from "../components/Transitions/PageTransition";
import { LoadingOverlay } from "../components/Transitions/PageTransition";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useResponsive } from "../hooks/useResponsive";
import { useScreenReaderAnnouncement, ariaPatterns } from "../hooks/useScreenReader";
import { generateTests, type TestGenRequest, type TestGenResponse } from "../services/api";

const CodeEditor = React.lazy(() => import("../components/CodeEditor"));
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];
const sampleCode = {
  python: `def add_numbers(a, b):
    """Add two numbers and return the result."""
    return a + b
def divide_numbers(a, b):
    """Divide two numbers and return the result."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
class Calculator:
    def __init__(self):
        self.history = []
    def calculate(self, operation, a, b):
        if operation == "add":
            result = add_numbers(a, b)
        elif operation == "divide":
            result = divide_numbers(a, b)
        else:
            raise ValueError("Unsupported operation")
        self.history.append((operation, a, b, result))
        return result`,
  javascript: `function addNumbers(a, b) {
    return a + b;
}
function divideNumbers(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}
class Calculator {
    constructor() {
        this.history = [];
    }
    calculate(operation, a, b) {
        let result;
        if (operation === "add") {
            result = addNumbers(a, b);
        } else if (operation === "divide") {
            result = divideNumbers(a, b);
        } else {
            throw new Error("Unsupported operation");
        }
        this.history.push({ operation, a, b, result });
        return result;
    }
}`,
  java: `public class Calculator {
    private List<String> history;
    public Calculator() {
        this.history = new ArrayList<>();
    }
    public int addNumbers(int a, int b) {
        return a + b;
    }
    public double divideNumbers(double a, double b) {
        if (b == 0) {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        return a / b;
    }
    public double calculate(String operation, double a, double b) {
        double result;
        switch (operation) {
            case "add":
                result = addNumbers((int)a, (int)b);
                break;
            case "divide":
                result = divideNumbers(a, b);
                break;
            default:
                throw new IllegalArgumentException("Unsupported operation");
        }
        history.add(operation + "(" + a + ", " + b + ") = " + result);
        return result;
    }
}`,
};
export default function TestGenPage() {
  // State management
  const [language, setLanguage] = useState<keyof typeof sampleCode>("python");
  const [code, setCode] = useState(sampleCode.python);
  const [fileName, setFileName] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestGenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [initializedFromParams, setInitializedFromParams] = useState(false);
  // Hooks
  const { isMobile } = useResponsive();
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
      // Auto-run after state updates on next tick
      setTimeout(() => {
        handleGenerate(paramLang && (paramLang in sampleCode) ? (paramLang as keyof typeof sampleCode) : language, paramCode);
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
  const handleGenerate = async (
    langOverride?: keyof typeof sampleCode,
    codeOverride?: string
  ) => {
    const effectiveLanguage = langOverride ?? language;
    const effectiveCode = codeOverride ?? code;
    if (!effectiveCode.trim()) {
      const errorMessage = "Please enter code to generate tests for";
      setError(errorMessage);
      announce(errorMessage, "assertive");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Generating unit tests...");
    try {
      const request: TestGenRequest = {
        language: effectiveLanguage,
        code: effectiveCode.trim(),
        file: fileName.trim() || undefined,
        function: functionName.trim() || undefined,
      };
      const response = await generateTests(request);
      setResult(response);
      announce(`Test generation completed. Generated tests using ${response.framework} with ${response.coverage}% coverage.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate tests";
      setError(errorMessage);
      announce(`Test generation failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };
  const copyToClipboard = async () => {
    if (result?.tests) {
      try {
        await navigator.clipboard.writeText(result.tests);
        setCopySuccess(true);
        announce("Tests copied to clipboard successfully");
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error("Failed to copy to clipboard:", err);
        announce("Failed to copy tests to clipboard", "assertive");
      }
    }
  };
  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={loading}
          message="Generating unit tests..."
          type="spinner"
        />
        {/* Header Section */}
        <motion.div
          className="fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1
            className="text-3xl font-bold text-foreground"
            {...ariaPatterns.navigation("Test Generator")}
          >
            Test Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Generate comprehensive unit tests for your code automatically
          </p>
        </motion.div>
        {/* Main Content Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* Input Section */}
          <motion.div
            className="fade-in"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="card-elevate fade-in h-fit">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Code Input
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
                <Input
                  label="File Name (optional)"
                  placeholder="calculator.py"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="input-focus-anim"
                  {...ariaPatterns.textbox("File name input")}
                />
                <Input
                  label="Function Name (optional)"
                  placeholder="add_numbers"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  helperText="Leave empty to generate tests for all functions"
                  className="input-focus-anim"
                  {...ariaPatterns.textbox("Function name input")}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Code
                  </label>
                  <Suspense
                    fallback={
                      <textarea
                        className="w-full h-64 px-3 py-2 border border-border rounded-md shadow-sm
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
                  onClick={() => handleGenerate()}
                  loading={loading}
                  disabled={!code.trim()}
                  fullWidth
                  className="btn-anim"
                  {...ariaPatterns.button("Generate unit tests")}
                >
                  Generate Tests
                </Button>
              </div>
            </Card>
          </motion.div>
          {/* Results Section */}
          <motion.div
            className="fade-in"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="card-elevate fade-in h-fit">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Generated Tests
                </h2>
                {result && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className={`btn-anim ${copySuccess ? 'success-bounce' : ''}`}
                    {...ariaPatterns.button("Copy generated tests")}
                  >
                    {copySuccess ? '✓ Copied!' : 'Copy Tests'}
                  </Button>
                )}
              </div>
              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="error-shake fade-in mb-4"
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
                  transition={{ duration: 0.3 }}
                >
                  {/* Test Statistics */}
                  <div className="grid grid-cols-2 gap-4 list-stagger">
                    <motion.div
                      className="text-center p-4 performance-tile neutral card-elevate"
                      style={{ '--i': 0 } as React.CSSProperties}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-lg font-semibold text-primary">
                        {result.framework}
                      </div>
                      <div className="text-sm text-primary-foreground">Test Framework</div>
                    </motion.div>
                    <motion.div
                      className="text-center p-4 performance-tile positive card-elevate"
                      style={{ '--i': 1 } as React.CSSProperties}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-lg font-semibold text-good">
                        {result.coverage}%
                      </div>
                      <div className="text-sm text-foreground">Expected Coverage</div>
                    </motion.div>
                  </div>
                  {/* Generated Test Code */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Generated Test Code
                    </label>
                    <div className="relative">
                      <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm font-mono max-h-96 border border-border text-foreground">
                        <code>{result.tests}</code>
                      </pre>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-12 text-muted-foreground fade-in"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </motion.svg>
                  <p className="text-lg font-medium mb-2">Ready to generate tests</p>
                  <p className="text-sm">Enter your code and click "Generate Tests" to get started</p>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
