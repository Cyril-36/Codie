import { motion } from "framer-motion";
import React from "react";

export interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "gradient";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loading({
  size = "md",
  variant = "spinner",
  text,
  className = "",
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const LoadingSpinner = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className={`${sizeClasses[size]} animate-spin`}>
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size]} bg-brand-primary rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );

      case "pulse":
        return (
          <motion.div
            className={`${sizeClasses[size]} bg-brand-primary rounded-full`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );

      case "gradient":
        return (
          <div className={`${sizeClasses[size]} spinner`} />
        );

      default:
        return <LoadingSpinner />;
    }
  };

  const LoadingContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <LoadingSpinner />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`text-text-secondary ${textSizeClasses[size]} text-center`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        {LoadingContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {LoadingContent}
    </motion.div>
  );
}
