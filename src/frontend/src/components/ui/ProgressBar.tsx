import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}
export default function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  showPercentage = false,
  label,
  animated = true,
  striped = false,
  className = "",
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  // Animate value changes
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);
  // Calculate percentage
  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);
  // Size classes
  const sizeClasses = {
    sm: "h-2",
    md: "h-3", 
    lg: "h-4",
  };
  // Variant colors
  const variantClasses = {
    default: "bg-primary-600",
    success: "bg-success-500",
    warning: "bg-warning-500", 
    error: "bg-error-500",
  };
  // Background colors
  const backgroundClasses = {
    default: "bg-primary-100 dark:bg-primary-900/20",
    success: "bg-success-100 dark:bg-success-900/20",
    warning: "bg-warning-100 dark:bg-warning-900/20",
    error: "bg-error-100 dark:bg-error-900/20",
  };
  return (
    <div className={`w-full ${className}`}>
      {/* Label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label || `Progress`}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      {/* Progress bar container */}
      <div
        className={`
          w-full rounded-full overflow-hidden
          ${sizeClasses[size]}
          ${backgroundClasses[variant]}
        `}
      >
        {/* Progress bar fill */}
        <motion.div
          className={`
            h-full rounded-full transition-all duration-300
            ${variantClasses[variant]}
            ${striped ? "bg-stripes" : ""}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
}
// Circular Progress Component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}
export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "default",
  showLabel = false,
  showPercentage = true,
  label,
  animated = true,
  className = "",
}: CircularProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);
  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  // Variant colors
  const variantColors = {
    default: "#2563EB", // primary-600
    success: "#10B981", // success-500
    warning: "#F59E0B", // warning-500
    error: "#EF4444",   // error-500
  };
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ 
            duration: animated ? 1.5 : 0,
            ease: "easeOut"
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
        {showLabel && label && (
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
// Multi-step Progress Component
export interface StepProgressProps {
  steps: string[];
  currentStep: number;
  variant?: "default" | "success" | "warning" | "error";
  orientation?: "horizontal" | "vertical";
  showLabels?: boolean;
  className?: string;
}
export function StepProgress({
  steps,
  currentStep,
  variant = "default",
  orientation = "horizontal",
  showLabels = true,
  className = "",
}: StepProgressProps) {
  const variantClasses = {
    default: "bg-primary-600 border-primary-600",
    success: "bg-success-500 border-success-500",
    warning: "bg-warning-500 border-warning-500",
    error: "bg-error-500 border-error-500",
  };
  const isHorizontal = orientation === "horizontal";
  return (
    <div className={`${isHorizontal ? "flex items-center" : "flex flex-col"} ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const _isUpcoming = index > currentStep;
        return (
          <div
            key={index}
            className={`
              flex items-center
              ${isHorizontal ? "flex-row" : "flex-col"}
              ${index < steps.length - 1 ? (isHorizontal ? "flex-1" : "mb-4") : ""}
            `}
          >
            {/* Step circle */}
            <div className="relative flex items-center justify-center">
              <motion.div
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted || isCurrent 
                    ? variantClasses[variant] + " text-white"
                    : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </motion.div>
            </div>
            {/* Step label */}
            {showLabels && (
              <span
                className={`
                  text-sm font-medium
                  ${isHorizontal ? "ml-2" : "mt-2"}
                  ${isCurrent 
                    ? "text-gray-900 dark:text-gray-100" 
                    : "text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {step}
              </span>
            )}
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  ${isHorizontal 
                    ? "flex-1 h-0.5 mx-4" 
                    : "w-0.5 h-8 my-2 ml-4"
                  }
                  ${isCompleted 
                    ? variantClasses[variant].split(" ")[0]
                    : "bg-gray-300 dark:bg-gray-600"
                  }
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
