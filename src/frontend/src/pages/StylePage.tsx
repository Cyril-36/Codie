import { motion } from "framer-motion";
import React, { useState, Suspense } from "react";

import { ScoreDisplay } from "../components/Analysis/ScoreDisplay";
import { PageTransition, LoadingOverlay, ProgressIndicator } from "../components/Transitions/PageTransition";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import { useScreenReaderAnnouncement, ariaPatterns } from "../hooks/useScreenReader";
import { checkStyle, type StyleRequest, type StyleResponse } from "../services/api";
import { getSeverityColors } from "../utils/theme";

const CodeEditor = React.lazy(() => import("../components/CodeEditor"));
const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];
const sampleCode = {
  python: `def calculate_total(items):
    total = 0
    for item in items:
        if item['price'] > 0:
            total += item['price']
    return total
class ShoppingCart:
    def __init__(self):
        self.items = []
    def add_item(self, item):
        self.items.append(item)`,
  javascript: `function calculateTotal(items) {
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].price > 0) {
            total += items[i].price;
        }
    }
    return total;
}
class ShoppingCart {
    constructor() {
        this.items = [];
    }
    addItem(item) {
        this.items.push(item);
    }
}`,
  java: `public class ShoppingCart {
    private List<Item> items;
    public ShoppingCart() {
        this.items = new ArrayList<>();
    }
    public void addItem(Item item) {
        items.add(item);
    }
    public double calculateTotal() {
        double total = 0;
        for (Item item : items) {
            if (item.getPrice() > 0) {
                total += item.getPrice();
            }
        }
        return total;
    }
}`,
};
export default function StylePage() {
  // State management
  const [language, setLanguage] = useState<keyof typeof sampleCode>("python");
  const [code, setCode] = useState(sampleCode.python);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StyleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Hooks
  const { announce } = useScreenReaderAnnouncement();
  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as keyof typeof sampleCode;
    setLanguage(lang);
    setCode(sampleCode[lang]);
    setResult(null);
    setError(null);
    announce(`Language changed to ${newLanguage}`);
  };
  const handleCheck = async () => {
    if (!code.trim()) {
      const errorMessage = "Please enter code to analyze";
      setError(errorMessage);
      announce(errorMessage, "assertive");
      return;
    }
    setLoading(true);
    setError(null);
    announce("Analyzing code style...");
    try {
      const request: StyleRequest = {
        language,
        snippet: code.trim(),
      };
      const response = await checkStyle(request);
      setResult(response);
      const issueCount = response.issues.length;
      announce(
        issueCount === 0
          ? `Style analysis completed. Perfect score of ${response.score}! No issues found.`
          : `Style analysis completed. Score: ${response.score}. Found ${issueCount} style issues.`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check code style";
      setError(errorMessage);
      announce(`Style analysis failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Loading Overlay */}
        <LoadingOverlay
          isLoading={loading}
          message="Analyzing code style..."
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
            {...ariaPatterns.navigation("Style Checker")}
          >
            Style Checker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Analyze your code for style issues and best practices
          </p>
        </motion.div>
        {/* Input Form */}
        <motion.div
          className="fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="card-elevate fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Code Style Analyzer
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
                onClick={handleCheck}
                loading={loading}
                disabled={!code.trim()}
                fullWidth
                className="btn-anim"
                {...ariaPatterns.button("Check code style")}
              >
                Check Style
              </Button>
            </div>
          </Card>
        </motion.div>
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="error-shake fade-in"
          >
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </motion.div>
        )}
        {/* Results Section */}
        {result && (
          <motion.div
            className="space-y-6 fade-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="card-elevate fade-in" aria-live="polite">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Style Analysis Results
              </h2>
              {/* Score Display */}
              <div className="flex justify-center mb-8">
                <ScoreDisplay
                  score={result.score}
                  size="large"
                  animated={true}
                  showTooltip={true}
                  tooltipContent={`Style Score: ${result.score}/100`}
                />
              </div>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Code Quality
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {result.score}/100
                  </span>
                </div>
                <ProgressIndicator
                  value={result.score}
                  max={100}
                  variant="linear"
                  color={result.score >= 80 ? 'success' : result.score >= 60 ? 'warning' : 'error'}
                  animated={true}
                  showValue={false}
                />
              </div>
              {/* Style Issues */}
              {result.issues.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="success-bounce fade-in"
                >
                  <Alert variant="success">
                    🎉 Perfect! No style issues found in your code.
                  </Alert>
                </motion.div>
              ) : (
                <div>
                  <h3 className="font-medium text-foreground mb-4">
                    Style Issues ({result.issues.length})
                  </h3>
                  <motion.div
                    className="space-y-3 list-stagger"
                    variants={{
                      animate: {
                        transition: {
                          staggerChildren: 0.1,
                        },
                      },
                    }}
                    initial="initial"
                    animate="animate"
                  >
                    {result.issues.map((issue, index) => {
                      const severityColors = getSeverityColors('medium');
                      return (
                        <motion.div
                          key={index}
                          variants={{
                            initial: { opacity: 0, x: -20 },
                            animate: { opacity: 1, x: 0 },
                          }}
                          transition={{ duration: 0.3 }}
                          className={`
                            p-4 border-l-4 rounded-lg card-elevate
                            ${severityColors.bg} ${severityColors.border}
                            border border-border
                          `}
                          whileHover={{ scale: 1.01 }}
                          style={{ '--i': index } as React.CSSProperties}
                        >
                          <div className="flex items-start gap-3">
                            <Badge variant="warning">
                              Line {issue.line}
                            </Badge>
                            <div className="flex-1">
                              <p className={`text-sm ${severityColors.text} mb-2`}>
                                {issue.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Severity: {issue.severity}</span>
                                {issue.rule && (
                                  <>
                                    <span>•</span>
                                    <span>Rule: {issue.rule}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
