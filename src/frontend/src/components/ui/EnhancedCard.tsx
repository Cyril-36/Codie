import React, { useState, forwardRef } from 'react';

import type { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hover?: boolean;
  clickable?: boolean;
  loading?: boolean;
  shimmer?: boolean;
  className?: string;
  onClick?: () => void;
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      icon: Icon,
      title,
      subtitle,
      actions,
      hover = false,
      clickable = false,
      loading = false,
      shimmer = false,
      className = '',
      onClick,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    const handleMouseDown = () => {
      if (clickable) {
        setIsPressed(true);
      }
    };

    const handleMouseUp = () => {
      if (clickable) {
        setIsPressed(false);
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'elevated':
          return 'shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-card-hover)]';
        case 'outlined':
          return 'border-2 border-[color:var(--border)] bg-transparent';
        case 'interactive':
          return 'shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-card-hover)] cursor-pointer';
        default:
          return 'shadow-[var(--elevation-card)]';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'p-3';
        case 'md':
          return 'p-4';
        case 'lg':
          return 'p-6';
        default:
          return 'p-4';
      }
    };

    const baseClasses = `
      card relative overflow-hidden
      transition-all duration-300 ease-out
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${hover ? 'hover:scale-[1.02] hover:-translate-y-1' : ''}
      ${clickable ? 'cursor-pointer select-none' : ''}
      ${isPressed ? 'scale-[0.98] translate-y-0' : ''}
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={baseClasses}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {/* Header */}
        {(title || Icon || actions) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--highlight)] flex items-center justify-center transition-transform duration-200 ${
                  isHovered ? 'scale-110' : ''
                }`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="font-semibold text-[color:var(--foreground)]">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-[color:var(--card)]/80 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[color:var(--primary)] border-t-transparent" />
            </div>
          )}
          
          {shimmer && (
            <div className="shimmer absolute inset-0 rounded-lg" />
          )}
          
          <div className={loading ? 'opacity-50' : ''}>
            {children}
          </div>
        </div>

        {/* Hover overlay */}
        {hover && (
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--primary)]/5 to-transparent opacity-0 transition-opacity duration-300 rounded-lg pointer-events-none" />
        )}

        {/* Interactive overlay */}
        {clickable && (
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--primary)]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
        )}
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export default EnhancedCard;
