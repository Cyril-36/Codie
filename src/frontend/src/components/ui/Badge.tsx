import { motion } from "framer-motion";
import React from "react";

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "high" | "medium" | "low";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

export default function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
  animated = true,
  onClick,
}: BadgeProps) {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-full
    transition-all duration-300 ease-out
    ${onClick ? "cursor-pointer hover:scale-105" : ""}
  `;

  const variantClasses = {
    default: "bg-bg-hover text-text-primary border border-border-default",
    success: "bg-success-bg text-success border border-success-border",
    warning: "bg-warning-bg text-warning border border-warning-border",
    error: "bg-error-bg text-error border border-error-border",
    info: "bg-info-bg text-info border border-info-border",
    high: "badge badge-priority-high",
    medium: "badge badge-priority-medium",
    low: "badge badge-priority-low",
  } as const;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  } as const;

  const combinedClasses = `    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const BadgeContent = (
    <div className={combinedClasses}>
      {children}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
        whileHover={{ scale: onClick ? 1.05 : 1 }}
        whileTap={{ scale: onClick ? 0.95 : 1 }}
        onClick={onClick}
      >
        {BadgeContent}
      </motion.div>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick}>
        {BadgeContent}
      </div>
    );
  }

  return BadgeContent;
}

