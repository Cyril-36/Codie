import { motion } from 'framer-motion';
import { CaretDown, CaretUp, Copy, CheckCircle } from 'phosphor-react';
import React, { useState } from 'react';

import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface SuggestionCardProps {
  suggestion: {
    message: string;
    confidence: number;
    severity?: 'high' | 'medium' | 'low';
    code?: string;
    line?: number;
  };
  index: number;
  onApplyFix?: (suggestion: any) => void;
  className?: string;
}
export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  index,
  onApplyFix,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };
  const getSeverityBorder = (severity?: string) => {
    switch (severity) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };
  const handleCopy = async () => {
    if (suggestion.code) {
      try {
        await navigator.clipboard.writeText(suggestion.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };
  const confidencePercentage = Math.round(suggestion.confidence * 100);
  return (
    <motion.div
      className={`
        border border-gray-200 dark:border-gray-700 rounded-lg p-4 
        bg-white dark:bg-gray-800 shadow-sm hover:shadow-md 
        transition-all duration-200 border-l-4 ${getSeverityBorder(suggestion.severity)}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {suggestion.severity && (
              <Badge variant={getSeverityColor(suggestion.severity)}>
                {suggestion.severity.toUpperCase()}
              </Badge>
            )}
            {suggestion.line && (
              <Badge variant="default">
                Line {suggestion.line}
              </Badge>
            )}
            <Badge variant="default">
              {confidencePercentage}% confidence
            </Badge>
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-sm leading-relaxed">
            {suggestion.message}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {suggestion.code && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="p-2"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
          {suggestion.code && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <CaretUp className="w-4 h-4" />
              ) : (
                <CaretDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      {/* Expandable code section */}
      {suggestion.code && (
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                <code>{suggestion.code}</code>
              </pre>
            </div>
            {onApplyFix && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onApplyFix(suggestion)}
                >
                  Apply Fix
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
