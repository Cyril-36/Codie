import { motion } from "framer-motion";
import React from "react";
import { useEffect } from "react";

interface ScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'large';
  animated?: boolean;
  showTooltip?: boolean;
  tooltipContent?: string;
  className?: string;
  label?: string;
}
const ScoreDisplayBase: React.FC<ScoreDisplayProps> = ({
  score,
  size = 'md',
  animated = true,
  showTooltip = false,
  tooltipContent,
  className = '',
  label,
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm': return { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-sm' };
      case 'md': return { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-base' };
      case 'lg': return { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-lg' };
      case 'large': return { width: 160, height: 160, strokeWidth: 10, fontSize: 'text-2xl' };
      default: return { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-base' };
    }
  };
  const getColor = () => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#3b82f6'; // blue
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };
  const { width, height, strokeWidth, fontSize } = getSize();
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    if (!animated) return;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => void 0);
    }
  }, [animated, score]);
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} data-testid="score-display" aria-label={label ? `${label}: ${score}` : undefined}>
      <svg
        width={width}
        height={height}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={animated ? { duration: 1, ease: "easeOut" } : { duration: 0 }}
        />
      </svg>
      {/* Score text */}
      <div className={`absolute inset-0 flex items-center justify-center ${fontSize} font-bold text-gray-900 dark:text-white`}>
        <span>{score}</span>
        <span aria-hidden="true">%</span>
      </div>
      {/* Tooltip */}
      {showTooltip && tooltipContent && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
export const ScoreDisplay = React.memo(ScoreDisplayBase);
export default ScoreDisplay;
// CommonJS interop for tests
try {
  // @ts-ignore
  if (typeof module !== 'undefined' && module && module.exports) {
    // @ts-ignore
    if (!('default' in module.exports)) {
      // @ts-ignore
      module.exports.default = exports.default || ScoreDisplay;
    }
  }
} catch { void 0; }
