import { motion } from 'framer-motion';
import { Expand, Download, CheckCircle, Copy } from 'lucide-react';
import React, { useState, useRef } from 'react';

export interface CodeSnippetProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
  showExpandButton?: boolean;
  maxHeight?: string;
  highlightLines?: number[];
  className?: string;
  onCopy?: (code: string) => void;
  onDownload?: (code: string, filename?: string) => void;
  onExpand?: () => void;
}
export default function CodeSnippet({
  code,
  language = "javascript",
  filename,
  showLineNumbers = true,
  showCopyButton = true,
  showDownloadButton = false,
  showExpandButton = false,
  maxHeight = "400px",
  highlightLines = [],
  className = "",
  onCopy,
  onDownload,
  onExpand,
}: CodeSnippetProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);
  // Handle copy functionality
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      onCopy?.(code);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };
  // Handle download functionality
  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.(code, filename);
  };
  // Handle expand functionality
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand?.();
  };
  // Get file extension based on language
  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      swift: "swift",
      kotlin: "kt",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      yaml: "yml",
      markdown: "md",
      sql: "sql",
      shell: "sh",
      bash: "sh",
      powershell: "ps1",
    };
    return extensions[lang] || "txt";
  };
  // Simple syntax highlighting (basic implementation)
  const highlightSyntax = (code: string, language: string): string => {
    // This is a basic implementation. In a real app, you'd use a library like Prism.js or highlight.js
    const keywords = {
      javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export"],
      typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "class", "import", "export", "interface", "type"],
      python: ["def", "class", "import", "from", "return", "if", "else", "elif", "for", "while", "try", "except"],
      java: ["public", "private", "class", "interface", "return", "if", "else", "for", "while", "try", "catch"],
    };
    const langKeywords = keywords[language as keyof typeof keywords] || [];
    let highlighted = code;
    // Highlight keywords
    langKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      highlighted = highlighted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
    });
    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="text-green-400">$1$2$1</span>'
    );
    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
      '<span class="text-gray-500 italic">$1</span>'
    );
    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-yellow-400">$1</span>'
    );
    return highlighted;
  };
  const lines = code.split("\n");
  const highlightedCode = highlightSyntax(code, language);
  const highlightedLines = highlightedCode.split("\n");
  return (
    <motion.div
      className={`
        bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden
        border border-gray-700 dark:border-gray-800
        ${className}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          {/* Traffic light dots */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {/* Filename */}
          {filename && (
            <span className="text-sm font-medium text-gray-300 dark:text-gray-400">
              {filename}
            </span>
          )}
          {/* Language badge */}
          <span className="
            px-2 py-1 text-xs font-medium rounded
            bg-gray-700 text-gray-300 dark:bg-gray-800 dark:text-gray-400
          ">
            {language}
          </span>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {showExpandButton && (
            <motion.button
              type="button"
              onClick={handleExpand}
              className="
                p-2 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700
                transition-colors duration-fast
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <Expand size={16} />
            </motion.button>
          )}
          {showDownloadButton && (
            <motion.button
              type="button"
              onClick={handleDownload}
              className="
                p-2 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-700
                transition-colors duration-fast
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Download"
            >
              <Download size={16} />
            </motion.button>
          )}
          {showCopyButton && (
            <motion.button
              type="button"
              onClick={handleCopy}
              className="
                flex items-center gap-1 px-3 py-2 rounded text-sm font-medium
                text-gray-400 hover:text-gray-200 hover:bg-gray-700
                transition-colors duration-fast
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCopied ? (
                <>
                  <CheckCircle size={16} className="text-success-400" />
                  <span className="text-success-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
      {/* Code content */}
      <div 
        className="relative overflow-auto"
        style={{ 
          maxHeight: isExpanded ? "none" : maxHeight,
          fontFamily: "JetBrains Mono, Consolas, Monaco, monospace"
        }}
      >
        <pre
          ref={codeRef}
          className="p-4 text-sm leading-relaxed text-gray-300 dark:text-gray-400"
        >
          {showLineNumbers ? (
            <div className="flex">
              {/* Line numbers */}
              <div className="flex-shrink-0 pr-4 text-gray-500 dark:text-gray-600 select-none border-r border-gray-700 dark:border-gray-800 mr-4">
                {lines.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      text-right min-w-[2rem]
                      ${highlightLines.includes(index + 1) 
                        ? "bg-yellow-500/20 text-yellow-400" 
                        : ""
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              {/* Code lines */}
              <div className="flex-1 min-w-0">
                {highlightedLines.map((line, index) => (
                  <div
                    key={index}
                    className={`
                      ${highlightLines.includes(index + 1) 
                        ? "bg-yellow-500/10 -mx-4 px-4" 
                        : ""
                      }
                    `}
                    dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          )}
        </pre>
      </div>
      {/* Scroll indicator */}
      {!isExpanded && lines.length > 20 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
}
// Inline Code Component
export interface InlineCodeProps {
  children: React.ReactNode;
  className?: string;
}
export function InlineCode({ children, className = "" }: InlineCodeProps) {
  return (
    <code className={`
      px-1.5 py-0.5 text-sm font-mono
      bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
      rounded border
      ${className}
    `}>
      {children}
    </code>
  );
}
