import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
import { useLocation } from "react-router-dom";

// Page transition wrapper component
export interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  className?: string;
}
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 0.3,
  className = '',
}) => {
  const location = useLocation();
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 },
    },
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        variants={variants[type]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration,
          ease: 'easeOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
// Loading overlay component
export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'dots' | 'pulse' | 'progress';
}
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  progress,
  type = 'spinner',
}) => {
  if (!isLoading) return null;
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <motion.div
            className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        );
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <motion.div
            className="w-12 h-12 bg-primary-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      case 'progress':
        return (
          <div className="w-64 space-y-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            {progress !== undefined && (
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {Math.round(progress)}%
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <motion.div
      className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center space-y-4">
        {renderLoader()}
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
      </div>
    </motion.div>
  );
};
// Skeleton component for loading states
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};
// Skeleton group for complex layouts
export interface SkeletonGroupProps {
  lines?: number;
  avatar?: boolean;
  title?: boolean;
  className?: string;
}
export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  lines = 3,
  avatar = false,
  title = false,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height="1rem" />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        </div>
      )}
      {title && (
        <Skeleton width="80%" height="1.5rem" className="mb-4" />
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  );
};
// Progress indicator component
export interface ProgressIndicatorProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular';
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  animated?: boolean;
}
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'linear',
  showValue = true,
  color = 'primary',
  animated = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const sizeClasses = {
    sm: variant === 'linear' ? 'h-1' : 'w-8 h-8',
    md: variant === 'linear' ? 'h-2' : 'w-12 h-12',
    lg: variant === 'linear' ? 'h-3' : 'w-16 h-16',
  };
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  };
  if (variant === 'circular') {
    const radius = size === 'sm' ? 14 : size === 'md' ? 20 : 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className={sizeClasses[size]} viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-200 dark:text-gray-700"
          />
          <motion.circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={colorClasses[color]}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: animated ? strokeDashoffset : 0,
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        {showValue && (
          <span className="absolute text-xs font-medium text-gray-900 dark:text-gray-100">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
  return (
    <div className="w-full space-y-2">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]}`}>
        <motion.div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};
// Error state animation component
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Please try again later',
  onRetry,
  className = '',
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {message}
      </p>
      {onRetry && (
        <motion.button
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};
export default {
  PageTransition,
  LoadingOverlay,
  Skeleton,
  SkeletonGroup,
  ProgressIndicator,
  ErrorState,
};
