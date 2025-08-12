import { motion, AnimatePresence } from "framer-motion";
import {
  CaretDown,
  Copy,
  CheckCircle,
  WarningCircle,
  XCircle,
  Info,
  Code,
  Wrench
} from "phosphor-react";
import React, { useState } from "react";
export type SeverityLevel = "high" | "medium" | "low" | "info";
export interface SuggestionItemProps {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category?: string;
  codeSnippet?: string;
  fixSuggestion?: string;
  line?: number;
  column?: number;
  file?: string;
  onApplyFix?: (id: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}
export default function SuggestionItem({
  id,
  title,
  description,
  severity,
  category,
  codeSnippet,
  fixSuggestion,
  line,
  column,
  file,
  onApplyFix,
  onCopy,
  className = "",
  defaultExpanded = false,
}: SuggestionItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isCopied, setIsCopied] = useState(false);
  // Severity configuration with exact colors from design system
  const severityConfig = {
    high: {
      color: "#EF4444",      // error-500 (Red)
      bgColor: "#FEE2E2",    // error-100
      icon: XCircle,
      label: "High Priority",
      textColor: "text-error-600 dark:text-error-400"
    },
    medium: {
      color: "#F59E0B",      // warning-500 (Yellow)
      bgColor: "#FEF3C7",    // warning-100
      icon: WarningCircle,
      label: "Medium Priority",
      textColor: "text-warning-600 dark:text-warning-400"
    },
    low: {
      color: "#3B82F6",      // info-500 (Blue)
      bgColor: "#DBEAFE",    // info-100
      icon: Info,
      label: "Low Priority",
      textColor: "text-info-600 dark:text-info-400"
    },
    info: {
      color: "#10B981",      // success-500 (Green)
      bgColor: "#D1FAE5",    // success-100
      icon: CheckCircle,
      label: "Information",
      textColor: "text-success-600 dark:text-success-400"
    }
  };
  const config = severityConfig[severity];
  const IconComponent = config.icon;
  // Handle copy functionality
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onCopy?.(content);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  // Handle apply fix
  const handleApplyFix = () => {
    onApplyFix?.(id);
  };
  return (
    <motion.div
      className={`
        bg-white dark:bg-gray-800 border rounded-lg shadow-sm
        hover:shadow-md transition-all duration-fast
        ${className}
      `}
      style={{ borderLeftColor: config.color, borderLeftWidth: "4px" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Severity Icon */}
            <div className={`flex-shrink-0 mt-0.5 ${config.textColor}`}>
              <IconComponent size={20} weight="bold" />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Category */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h3>
                {category && (
                  <span className="
                    px-2 py-1 text-xs font-medium rounded-full
                    bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400
                  ">
                    {category}
                  </span>
                )}
              </div>
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {description}
              </p>
              {/* File location */}
              {(file || line !== undefined) && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <Code size={14} />
                  {file && <span>{file}</span>}
                  {line !== undefined && (
                    <span>
                      Line {line}{column !== undefined ? `:${column}` : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Severity Badge */}
            <span 
              className="
                px-2 py-1 text-xs font-medium rounded-full
                border
              "
              style={{ 
                backgroundColor: config.bgColor,
                borderColor: config.color,
                color: config.color
              }}
            >
              {config.label}
            </span>
            {/* Expand/Collapse Button */}
            {(codeSnippet || fixSuggestion) && (
              <motion.button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="
                  p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                  dark:hover:text-gray-300 dark:hover:bg-gray-700
                  transition-colors duration-fast
                  focus:outline-none focus:ring-2 focus:ring-primary-500
                "
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CaretDown size={16} weight="bold" />
                </motion.div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (codeSnippet || fixSuggestion) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              {/* Code Snippet */}
              {codeSnippet && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Code Preview
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopy(codeSnippet)}
                      className="
                        flex items-center gap-1 px-2 py-1 text-xs font-medium
                        text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-gray-700 rounded
                        transition-colors duration-fast
                      "
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle size={14} className="text-success-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="
                    bg-gray-900 dark:bg-gray-950 rounded-lg p-3 overflow-x-auto
                    font-mono text-sm
                  ">
                    <pre className="text-gray-300 dark:text-gray-400 whitespace-pre-wrap">
                      {codeSnippet}
                    </pre>
                  </div>
                </div>
              )}
              {/* Fix Suggestion */}
              {fixSuggestion && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Suggested Fix
                  </h4>
                  <div className="
                    bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800
                    rounded-lg p-3
                  ">
                    <p className="text-sm text-success-800 dark:text-success-200">
                      {fixSuggestion}
                    </p>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {onApplyFix && fixSuggestion && (
                  <motion.button
                    type="button"
                    onClick={handleApplyFix}
                    className="
                      flex items-center gap-2 px-3 py-2 text-sm font-medium
                      bg-primary-600 hover:bg-primary-700 text-white rounded-lg
                      transition-colors duration-fast
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                    "
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wrench size={16} weight="bold" />
                    Apply Fix
                  </motion.button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(description + (fixSuggestion ? `\n\nSuggested Fix: ${fixSuggestion}` : ""))}
                  className="
                    flex items-center gap-2 px-3 py-2 text-sm font-medium
                    text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100
                    border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700
                    rounded-lg transition-colors duration-fast
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                  "
                >
                  <Copy size={16} />
                  Copy Suggestion
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
// Suggestion List Component
export interface SuggestionListProps {
  suggestions: Array<Omit<SuggestionItemProps, "onApplyFix" | "onCopy"> & {
    id: string;
  }>;
  onApplyFix?: (id: string) => void;
  onCopy?: (content: string) => void;
  groupBySeverity?: boolean;
  showStats?: boolean;
  className?: string;
}
export function SuggestionList({
  suggestions,
  onApplyFix,
  onCopy,
  groupBySeverity = false,
  showStats = true,
  className = "",
}: SuggestionListProps) {
  // Calculate statistics
  const stats = suggestions.reduce((acc, suggestion) => {
    acc[suggestion.severity] = (acc[suggestion.severity] || 0) + 1;
    acc.total++;
    return acc;
  }, { high: 0, medium: 0, low: 0, info: 0, total: 0 } as Record<SeverityLevel, number> & { total: number });
  // Group suggestions by severity if requested
  const groupedSuggestions: Record<SeverityLevel, (Omit<SuggestionItemProps, "onCopy" | "onApplyFix"> & { id: string; })[]> | { all: (Omit<SuggestionItemProps, "onCopy" | "onApplyFix"> & { id: string; })[] } = groupBySeverity
    ? suggestions.reduce((acc, suggestion) => {
        if (!acc[suggestion.severity]) {
          acc[suggestion.severity] = [];
        }
        acc[suggestion.severity].push(suggestion);
        return acc;
      }, {} as Record<SeverityLevel, (Omit<SuggestionItemProps, "onCopy" | "onApplyFix"> & { id: string; })[]>)
    : { all: suggestions };
  const severityOrder: SeverityLevel[] = ["high", "medium", "low", "info"];
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistics */}
      {showStats && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total Issues
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-l-4 border-l-error-500">
            <div className="text-2xl font-bold text-error-600 dark:text-error-400">
              {stats.high}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              High Priority
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-l-4 border-l-warning-500">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {stats.medium}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Medium Priority
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-l-4 border-l-info-500">
            <div className="text-2xl font-bold text-info-600 dark:text-info-400">
              {stats.low}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Low Priority
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-l-4 border-l-success-500">
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {stats.info}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Information
            </div>
          </div>
        </motion.div>
      )}
      {/* Suggestions */}
      {groupBySeverity ? (
        <div className="space-y-6">
          {severityOrder.map((severity) => {
            const severityGroup = (groupedSuggestions as Record<SeverityLevel, (Omit<SuggestionItemProps, "onCopy" | "onApplyFix"> & { id: string; })[]>)[severity];
            if (!severityGroup || severityGroup.length === 0) return null;
            return (
              <div key={severity}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                  {severity} Priority ({severityGroup.length})
                </h3>
                <div className="space-y-3">
                  {severityGroup.map((suggestion: Omit<SuggestionItemProps, "onCopy" | "onApplyFix"> & { id: string; }, index: number) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <SuggestionItem
                        {...suggestion}
                        onApplyFix={onApplyFix}
                        onCopy={onCopy}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <SuggestionItem
                {...suggestion}
                onApplyFix={onApplyFix}
                onCopy={onCopy}
              />
            </motion.div>
          ))}
        </div>
      )}
      {/* Empty State */}
      {suggestions.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle size={48} className="mx-auto text-success-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Issues Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Your code looks great! No suggestions at this time.
          </p>
        </motion.div>
      )}
    </div>
  );
}
