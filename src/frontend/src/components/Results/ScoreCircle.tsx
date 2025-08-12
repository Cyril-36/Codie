import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
  showTooltip?: boolean;
  tooltipContent?: string;
}
export default function ScoreCircle({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth: _strokeWidth = 12,
  showLabel = true,
  label,
  animated = true,
  className = "",
  showTooltip = true,
  tooltipContent,
}: ScoreCircleProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // Animate score counting from 0 to target (1.5s duration as specified)
  useEffect(() => {
    if (animated) {
      const duration = 1500; // 1.5 seconds
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setDisplayScore(score);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, animated]);
  // Calculate percentage
  const percentage = Math.min(Math.max((displayScore / maxScore) * 100, 0), 100);
  // Color coding based on score ranges (as specified in design system)
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "#10B981", label: "Excellent", bg: "#D1FAE5" }; // Green
    if (score >= 60) return { color: "#3B82F6", label: "Good", bg: "#DBEAFE" };      // Blue
    if (score >= 40) return { color: "#F59E0B", label: "Fair", bg: "#FEF3C7" };      // Yellow
    return { color: "#EF4444", label: "Poor", bg: "#FEE2E2" };                      // Red
  };
  const scoreData = getScoreColor(displayScore);
  // Generate tooltip content
  const getTooltipContent = () => {
    if (tooltipContent) return tooltipContent;
    return `Score: ${Math.round(displayScore)}/${maxScore} (${scoreData.label})`;
  };
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Circular Progress */}
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        whileHover={{ scale: showTooltip ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Background circle for better visual depth */}
        <div 
          className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-800"
          style={{ 
            width: size, 
            height: size,
            filter: "blur(8px)",
            opacity: 0.3,
            transform: "scale(1.1)"
          }}
        />
        {/* Main circular progress */}
        <CircularProgressbar
          value={percentage}
          styles={buildStyles({
            // Customize the path (progress bar)
            pathColor: scoreData.color,
            pathTransitionDuration: animated ? 1.5 : 0,
            pathTransition: animated ? "stroke-dashoffset 1.5s ease-out" : "none",
            // Customize the trail (background)
            trailColor: "#F3F4F6", // gray-100
            // Customize the text
            textColor: "transparent", // We'll use custom text
          })}
        />
        {/* Custom center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Score number with 36px font as specified */}
          <motion.span
            className="text-4xl font-bold text-gray-900 dark:text-gray-100"
            style={{ fontSize: "36px", lineHeight: "1" }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(displayScore)}
          </motion.span>
          {/* Score label */}
          <motion.span
            className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            {scoreData.label}
          </motion.span>
        </div>
        {/* Tooltip */}
        {showTooltip && isHovered && (
          <motion.div
            className="
              absolute -top-12 left-1/2 transform -translate-x-1/2
              bg-gray-900 text-white text-sm font-medium
              px-3 py-2 rounded-lg shadow-lg
              whitespace-nowrap z-tooltip
            "
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {getTooltipContent()}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </motion.div>
      {/* Optional label below the circle */}
      {showLabel && label && (
        <motion.p
          className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
// Score Grid Component for multiple scores
export interface ScoreGridProps {
  scores: Array<{
    score: number;
    label: string;
    maxScore?: number;
  }>;
  size?: number;
  animated?: boolean;
  className?: string;
}
export function ScoreGrid({ 
  scores, 
  size = 100, 
  animated = true, 
  className = "" 
}: ScoreGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {scores.map((scoreData, index) => (
        <motion.div
          key={scoreData.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
        >
          <ScoreCircle
            score={scoreData.score}
            maxScore={scoreData.maxScore}
            size={size}
            label={scoreData.label}
            animated={animated}
          />
        </motion.div>
      ))}
    </div>
  );
}
// Mini Score Circle for compact displays
export interface MiniScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}
export function MiniScoreCircle({
  score,
  maxScore = 100,
  size = 60,
  showLabel = false,
  className = "",
}: MiniScoreCircleProps) {
  const percentage = Math.min(Math.max((score / maxScore) * 100, 0), 100);
  const scoreData = score >= 80 ? "#10B981" : score >= 60 ? "#3B82F6" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <CircularProgressbar
          value={percentage}
          text={`${Math.round(score)}`}
          styles={buildStyles({
            pathColor: scoreData,
            textColor: scoreData,
            trailColor: "#F3F4F6",
            textSize: "24px",
          })}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Score
        </span>
      )}
    </div>
  );
}
