import { motion } from "framer-motion";
// Spinner Component
export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  className?: string;
}
export function Spinner({ size = "md", color = "primary", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
  const colorClasses = {
    primary: "text-primary-600",
    white: "text-white",
    gray: "text-gray-400",
  };
  return (
    <motion.svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
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
    </motion.svg>
  );
}
// Skeleton Component
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "text" | "rectangular" | "circular";
  animation?: "pulse" | "wave" | "none";
}
export function Skeleton({ 
  width = "100%", 
  height = "1rem", 
  className = "",
  variant = "text",
  animation = "pulse"
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-pulse", // Could be enhanced with wave animation
    none: "",
  };
  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };
  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 
        ${variantClasses[variant]} 
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
}
// Loading Overlay Component
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  spinner?: boolean;
  backdrop?: boolean;
  className?: string;
}
export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = "Loading...",
  spinner = true,
  backdrop = true,
  className = ""
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <motion.div
          className={`
            absolute inset-0 flex flex-col items-center justify-center z-50
            ${backdrop ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm" : ""}
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col items-center gap-3">
            {spinner && <Spinner size="lg" />}
            {message && (
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {message}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
// Progress Dots Component
export interface ProgressDotsProps {
  count?: number;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "gray";
  className?: string;
}
export function ProgressDots({ count = 3, size = "md", color = "primary", className = "" }: ProgressDotsProps) {
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };
  const colorClasses = {
    primary: "bg-primary-600",
    gray: "bg-gray-400",
  };
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
}
// Card Skeleton Component
export interface CardSkeletonProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
  className?: string;
}
export function CardSkeleton({ 
  lines = 3, 
  showAvatar = false, 
  showImage = false,
  className = ""
}: CardSkeletonProps) {
  return (
    <div className={`p-6 space-y-4 ${className}`}>
      {showImage && (
        <Skeleton height="200px" variant="rectangular" />
      )}
      <div className="space-y-3">
        {showAvatar && (
          <div className="flex items-center gap-3">
            <Skeleton width="40px" height="40px" variant="circular" />
            <div className="space-y-2 flex-1">
              <Skeleton height="16px" width="60%" />
              <Skeleton height="14px" width="40%" />
            </div>
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton 
              key={index}
              height="16px" 
              width={index === lines - 1 ? "75%" : "100%"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
// Table Skeleton Component
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className = ""
}: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} height="20px" width="80%" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex}
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="16px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
// Export all components
export default {
  Spinner,
  Skeleton,
  LoadingOverlay,
  ProgressDots,
  CardSkeleton,
  TableSkeleton,
};
