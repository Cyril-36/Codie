import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

import { useResponsive } from '../../hooks/useResponsive';

// Mobile-optimized button component
export interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  touchOptimized?: boolean;
  hapticFeedback?: boolean;
}
export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  touchOptimized = true,
  hapticFeedback = true,
  className = '',
  onTouchStart,
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  // Handle haptic feedback
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
    onTouchStart?.(e);
  };
  // Mobile-optimized sizing
  const sizeClasses = {
    sm: isMobile ? 'h-11 px-4 text-base' : 'h-8 px-3 text-sm',      // 44px touch target
    md: isMobile ? 'h-12 px-6 text-lg' : 'h-10 px-4 text-sm',      // 48px touch target  
    lg: isMobile ? 'h-14 px-8 text-xl' : 'h-12 px-6 text-base',    // 56px touch target
  };
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-md',
    secondary: 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed select-none
    ${touchOptimized && isMobile ? 'touch-target' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;
  return (
    <motion.button
      ref={ref}
      className={baseClasses}
      onTouchStart={handleTouchStart}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      disabled={props.disabled}
      type={props.type}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    >
      {children}
    </motion.button>
  );
});
MobileButton.displayName = 'MobileButton';
// Mobile-optimized input component
export interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  touchOptimized?: boolean;
}
export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  error,
  helperText,
  touchOptimized: _touchOptimized = true,
  className = '',
  ...props
}, ref) => {
  const { isMobile } = useResponsive();
  // Mobile-optimized height (minimum 44px for touch)
  const inputHeight = isMobile ? 'h-12' : 'h-10'; // 48px on mobile, 40px on desktop
  const fontSize = isMobile ? 'text-base' : 'text-sm'; // 16px minimum on mobile to prevent zoom
  const inputClasses = `
    block w-full px-4 py-3 border rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${inputHeight}
    ${fontSize}
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900' 
      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
    }
    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    ${className}
  `;
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});
MobileInput.displayName = 'MobileInput';
// Mobile-optimized card component
export interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  touchOptimized?: boolean;
  interactive?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}
export const MobileCard = forwardRef<HTMLDivElement, MobileCardProps>(({
  children,
  className = '',
  touchOptimized: _touchOptimized = true,
  interactive = false,
  onTap: _onTap,
  onLongPress: _onLongPress,
  onSwipe: _onSwipe,
  ...props
}, _ref) => {
  const { isMobile } = useResponsive();
  const cardRef = React.useRef<HTMLDivElement>(null);
  // Set up touch gestures
  const [isPressed, _setIsPressed] = React.useState(false);
  // Mobile-optimized padding
  const padding = isMobile ? 'p-6' : 'p-4';
  const cardClasses = `
    bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
    shadow-sm transition-all duration-200
    ${interactive ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}
    ${isPressed ? 'scale-[0.98]' : ''}
    ${padding}
    ${className}
  `;
  return (
    <div
      ref={cardRef}
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
});
MobileCard.displayName = 'MobileCard';
// Mobile-optimized list item
export interface MobileListItemProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  showChevron?: boolean;
  onTap?: () => void;
  onSwipe?: (direction: 'left' | 'right') => void;
}
export const MobileListItem = forwardRef<HTMLDivElement, MobileListItemProps>(({
  children,
  className = '',
  showChevron = false,
  interactive = false,
  onTap: _onTap,
  onSwipe: _onSwipe,
  ...props
}, _ref) => {
  const { isMobile } = useResponsive();
  const itemRef = React.useRef<HTMLDivElement>(null);
  // Set up touch gestures
  const [isPressed, _setIsPressed] = React.useState(false);
  // Mobile-optimized height and padding
  const minHeight = isMobile ? 'min-h-[56px]' : 'min-h-[44px]';
  const padding = isMobile ? 'px-6 py-4' : 'px-4 py-3';
  const itemClasses = `
    flex items-center justify-between w-full
    ${minHeight} ${padding}
    ${interactive ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700' : ''}
    ${isPressed ? 'bg-gray-100 dark:bg-gray-700' : ''}
    transition-all duration-200 border-b border-gray-200 dark:border-gray-700 last:border-b-0
    ${className}
  `;
  return (
    <div
      ref={itemRef}
      className={itemClasses}
      {...props}
    >
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {showChevron && (
        <svg 
          className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
});
MobileListItem.displayName = 'MobileListItem';
// Mobile-optimized container
export interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  safeArea?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = '',
  safeArea = true,
  maxWidth = 'lg',
}) => {
  const { isMobile } = useResponsive();
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };
  const padding = isMobile ? 'px-4' : 'px-6';
  const safeAreaClasses = safeArea ? 'safe-area-inset-top safe-area-inset-bottom' : '';
  const containerClasses = `
    ${maxWidthClasses[maxWidth]} mx-auto ${padding}
    ${safeAreaClasses}
    ${className}
  `;
  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};
// Export all components
export default {
  MobileButton,
  MobileInput,
  MobileCard,
  MobileListItem,
  MobileContainer,
};
