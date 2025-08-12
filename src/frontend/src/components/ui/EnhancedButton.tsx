import React, { useState, useCallback, forwardRef } from 'react';

import type { LucideIcon } from 'lucide-react';

interface EnhancedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  ripple?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      disabled = false,
      loading = false,
      ripple = true,
      className = '',
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const [isRippling, setIsRippling] = useState(false);
    const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      // Ripple effect
      if (ripple) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        setRipplePosition({ x, y });
        setIsRippling(true);
        
        setTimeout(() => setIsRippling(false), 400);
      }

      onClick?.(event);
    }, [disabled, loading, ripple, onClick]);

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)]/90 shadow-[var(--shadow-xs)]';
        case 'secondary':
          return 'bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[color:var(--secondary)]/80';
        case 'outline':
          return 'border border-[color:var(--border)] bg-transparent hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]';
        case 'ghost':
          return 'bg-transparent hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]';
        case 'destructive':
          return 'bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)]/90';
        default:
          return 'bg-[color:var(--primary)] text-[color:var(--primary-foreground)]';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm h-8';
        case 'md':
          return 'px-4 py-2 text-sm h-10';
        case 'lg':
          return 'px-6 py-3 text-base h-12';
        default:
          return 'px-4 py-2 text-sm h-10';
      }
    };

    const baseClasses = `
      inline-flex items-center justify-center gap-2 font-medium rounded-lg
      transition-all duration-200 ease-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      relative overflow-hidden
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${className}
    `;

    const rippleClasses = `
      absolute inset-0 pointer-events-none
      ${isRippling ? 'is-rippling' : ''}
    `;

    return (
      <button
        ref={ref}
        type={type}
        className={baseClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}

        {/* Icon */}
        {Icon && !loading && iconPosition === 'left' && (
          <Icon className="w-4 h-4" />
        )}

        {/* Content */}
        <span className={loading ? 'opacity-0' : ''}>
          {children}
        </span>

        {/* Icon */}
        {Icon && !loading && iconPosition === 'right' && (
          <Icon className="w-4 h-4" />
        )}

        {/* Ripple effect */}
        {ripple && (
          <div
            className={rippleClasses}
            style={{
              '--x': `${ripplePosition.x}px`,
              '--y': `${ripplePosition.y}px`,
            } as React.CSSProperties}
          >
            <div className="absolute inset-auto left-[var(--x)] top-[var(--y)] w-0 h-0 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 rounded-full transition-all duration-400 ease-out" />
          </div>
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export default EnhancedButton;
