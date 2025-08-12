import { motion } from "framer-motion";
import React, { useState } from "react";

import { ScoreDisplay } from "../components/Analysis/ScoreDisplay";
import { PageTransition, LoadingOverlay } from "../components/Transitions/PageTransition";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import { useScreenReaderAnnouncement, ariaPatterns } from "../hooks/useScreenReader";
import { scanSecurity, type SecurityRequest, type SecurityResponse } from "../services/api";

const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
];

export default function SecurityPage() {
  // State management
  const [language, setLanguage] = useState("python");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecurityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Accessibility announcements
  const { announce } = useScreenReaderAnnouncement();

  const fillSample = () => {
    const sample =
      language === "python"
        ? "requests==2.25.1\nnumpy>=1.20.0\ndjango<4.0"
        : language === "javascript"
        ? "express@4.17.1\nlodash@^4.17.20\nreact@17.0.2"
        : "spring-boot-starter-web:2.5.0\njackson-databind:2.12.3";
    setRequirements(sample);
  };

  const handleScan = async () => {
    if (!requirements.trim()) {
      const errorMessage = "Please enter requirements to scan";
      setError(errorMessage);
      announce(errorMessage, "assertive");
      return;
    }

    setLoading(true);
    setError(null);
    announce("Scanning dependencies for security vulnerabilities...");

    try {
      const request: SecurityRequest = {
        language,
        requirements: requirements.trim(),
      };
      const response = await scanSecurity(request);
      setResult(response);

      const totalVulns = response.summary.total;
      const highVulns = response.summary.high;
      announce(
        totalVulns === 0
          ? "Security scan completed. No vulnerabilities found!"
          : `Security scan completed. Found ${totalVulns} vulnerabilities, ${highVulns} high severity.`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to scan for security vulnerabilities";
      setError(errorMessage);
      announce(`Security scan failed: ${errorMessage}`, "assertive");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "error" as const;
      case "medium":
        return "warning" as const;
      case "low":
        return "info" as const;
      default:
        return "default" as const;
    }
  };

  // Calculate a simple security score based on vulnerabilities
  const getSecurityScore = (summary: SecurityResponse["summary"]) => {
    if (summary.total === 0) return 100;
    const weightedScore = 100 - (summary.high * 30 + summary.medium * 15 + summary.low * 5);
    return Math.max(0, Math.min(100, weightedScore));
  };

  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Loading Overlay */}
        <LoadingOverlay isLoading={loading} message="Scanning for security vulnerabilities..." type="spinner" />

        {/* Header Section */}
        <motion.div 
          className="fade-in"
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-foreground" {...ariaPatterns.navigation("Security Scanner")}>
            Security Scanner
          </h1>
          <p className="mt-2 text-muted-foreground">
            Scan your dependencies for known security vulnerabilities
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
            <h2 className="text-xl font-semibold text-foreground mb-4">Dependency Scanner</h2>
            <div className="space-y-4">
              <Select
                label="Language"
                options={languageOptions}
                value={language}
                onChange={(e: any) => setLanguage(e.target.value)}
                isLanguageSelector={true}
                {...ariaPatterns.textbox("Programming language selection")}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Requirements/Dependencies
                  </label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fillSample}
                    className="btn-anim"
                  >
                    Use sample
                  </Button>
                </div>
                <textarea
                  className="w-full h-32 px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-input text-foreground resize-none input-focus-anim"
                  placeholder={
                    language === "python"
                      ? "requests==2.25.1\nnumpy>=1.20.0\ndjango<4.0"
                      : language === "javascript"
                      ? "express@4.17.1\nlodash@^4.17.20\nreact@17.0.2"
                      : "spring-boot-starter-web:2.5.0\njackson-databind:2.12.3"
                  }
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  {...ariaPatterns.textbox("Dependencies input")}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your {language} dependencies, one per line. You can paste from requirements.txt, package.json versions, or Maven coordinates.
                </p>
              </div>

              <Button
                onClick={handleScan}
                loading={loading}
                disabled={!requirements.trim()}
                fullWidth
                className="btn-anim"
                {...ariaPatterns.button("Scan for vulnerabilities")}
              >
                Scan for Vulnerabilities
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
            <Card className="card-elevate fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-6">Security Scan Results</h2>

              {/* Security Score Display */}
              <div className="flex justify-center mb-8">
                <ScoreDisplay
                  score={getSecurityScore(result.summary)}
                  size="large"
                  animated={true}
                  showTooltip={true}
                  tooltipContent={`Security Score: ${getSecurityScore(result.summary)}/100`}
                />
              </div>

              {/* Vulnerability Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 list-stagger">
                <motion.div 
                  className="text-center p-4 performance-tile neutral card-elevate" 
                  style={{ '--i': 0 } as React.CSSProperties}
                  whileHover={{ scale: 1.02 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold text-foreground">{result.summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 performance-tile negative card-elevate" 
                  style={{ '--i': 1 } as React.CSSProperties}
                  whileHover={{ scale: 1.02 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold text-destructive">{result.summary.high}</div>
                  <div className="text-sm text-destructive-foreground">High Severity</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 performance-tile negative card-elevate" 
                  style={{ '--i': 2 } as React.CSSProperties}
                  whileHover={{ scale: 1.02 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold text-warning">{result.summary.medium}</div>
                  <div className="text-sm text-warning-foreground">Medium Severity</div>
                </motion.div>
                <motion.div 
                  className="text-center p-4 performance-tile neutral card-elevate" 
                  style={{ '--i': 3 } as React.CSSProperties}
                  whileHover={{ scale: 1.02 }} 
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-2xl font-bold text-primary">{result.summary.low}</div>
                  <div className="text-sm text-primary-foreground">Low Severity</div>
                </motion.div>
              </div>

              {/* Vulnerability Results */}
              {result.vulnerabilities.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="success-bounce fade-in"
                >
                  <Alert variant="success">🎉 Excellent! No security vulnerabilities found in your dependencies!</Alert>
                </motion.div>
              ) : (
                <div>
                  <h3 className="font-medium text-foreground mb-4">
                    Vulnerabilities Found ({result.vulnerabilities.length})
                  </h3>
                  <motion.div
                    className="space-y-3 list-stagger"
                    variants={{
                      animate: {
                        transition: { staggerChildren: 0.1 },
                      },
                    }}
                    initial="initial"
                    animate="animate"
                  >
                    {result.vulnerabilities.map((vuln, idx) => (
                      <motion.article
                        key={idx}
                        variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                        className="p-4 bg-card border border-border rounded-lg card-elevate"
                        style={{ '--i': idx } as React.CSSProperties}
                        role="article"
                        aria-labelledby={`vuln-title-${idx}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 id={`vuln-title-${idx}`} className="text-lg font-semibold text-foreground mb-2">
                              {vuln.package} <span className="text-sm font-normal text-muted-foreground">({vuln.version})</span>
                            </h4>
                            
                            {/* CVE Information */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default" className="font-mono text-xs">
                                  {vuln.cve}
                                </Badge>
                                <Badge variant="default" className="text-xs">
                                  {vuln.cve_source}
                                </Badge>
                              </div>
                              
                              {/* Version Range Information */}
                              {vuln.version_ranges && vuln.version_ranges.length > 0 && (
                                <div className="text-sm text-muted-foreground mb-2">
                                  <span className="font-medium">Affected versions:</span> {vuln.version_ranges.map((range, i) => (
                                    <span key={i} className="ml-1">
                                      {range.introduced} - {range.fixed}
                                      {i < vuln.version_ranges.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-foreground mb-3">{vuln.description}</p>
                            
                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Fixed in:</span>
                                <span className="ml-2 text-foreground">{vuln.fixed_in}</span>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Patch:</span>
                                <code className="ml-2 px-2 py-1 bg-muted rounded text-xs font-mono">
                                  {vuln.patch}
                                </code>
                              </div>
                              {vuln.cwe_ids && vuln.cwe_ids.length > 0 && (
                                <div>
                                  <span className="font-medium text-muted-foreground">CWE IDs:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {vuln.cwe_ids.map((cwe, i) => (
                                      <Badge key={i} variant="default" className="text-xs font-mono">
                                        {cwe}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {vuln.attack_vector && (
                                <div>
                                  <span className="font-medium text-muted-foreground">Attack Vector:</span>
                                  <span className="ml-2 text-foreground">{vuln.attack_vector}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* References */}
                            {vuln.references && vuln.references.length > 0 && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                  View References ({vuln.references.length})
                                </summary>
                                <div className="mt-2 space-y-1">
                                  {vuln.references.map((ref, i) => (
                                    <a
                                      key={i}
                                      href={ref}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-sm text-primary hover:underline break-all"
                                    >
                                      {ref}
                                    </a>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <Badge variant={getSeverityVariant(vuln.severity)}>{vuln.severity}</Badge>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(vuln.patch)}
                                className="text-xs px-2 py-1"
                                aria-label={`Copy patch command for ${vuln.package}`}
                              >
                                Copy Patch
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    ))}
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
