import { motion } from 'framer-motion';
import { CaretDown } from 'phosphor-react';
import React, { useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onDrag'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  isLanguageSelector?: boolean;
}
export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  fullWidth = false,
  variant = "default",
  size = "md",
  className = "",
  id,
  onFocus,
  onBlur,
  isLanguageSelector = false,
  ...props
}: SelectProps) {
  const [isFocused, setIsFocused] = useState(false);
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };
  // Base classes with exact design system specifications
  const baseClasses = `
    block font-sans text-sm transition-all duration-fast appearance-none cursor-pointer
    focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
    ${isLanguageSelector ? "" : "text-ellipsis overflow-hidden whitespace-nowrap"}
    ${fullWidth ? "w-full" : isLanguageSelector ? "min-w-[250px] w-full" : "min-w-[200px] w-full"}
  `;
  // Size classes matching Input component (40px height for md)
  const sizeClasses = {
    sm: "h-8 px-3 py-1.5 pr-16 text-sm",
    md: "h-input px-4 py-2 pr-28 text-sm leading-6", // more space for long labels like JavaScript
    lg: "h-12 px-4 py-3 pr-32 text-base",
  } as const;
  // Variant styles matching Input component
  const variantClasses = {
    default: `
      bg-white dark:bg-gray-800 border rounded-lg
      ${error
        ? "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-100 dark:focus:ring-error-900"
        : isFocused
          ? "border-primary-600 ring-2 ring-primary-100 dark:ring-primary-900"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
      }
      text-gray-900 dark:text-gray-100
    `,
    filled: `
      bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg
      ${error
        ? "bg-error-50 dark:bg-error-900/20 focus:ring-2 focus:ring-error-100 dark:focus:ring-error-900"
        : isFocused
          ? "bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-100 dark:ring-primary-900"
          : "hover:bg-gray-200 dark:hover:bg-gray-600"
      }
      text-gray-900 dark:text-gray-100
    `,
    outlined: `
      bg-transparent border-2 rounded-lg
      ${error
        ? "border-error-500 focus:border-error-600"
        : isFocused
          ? "border-primary-600"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
      }
      text-gray-900 dark:text-gray-100
    `,
  };
  const combinedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.replace(/\s+/g, " ").trim();
  // Arrow icon size and position based on select size
  const arrowSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  } as const;
  const arrowPosition = {
    sm: "right-3",
    md: "right-2",
    lg: "right-3",
  } as const;
  // Reserve extra space on the right for the caret based on control size
  const caretPadRight = size === 'sm' ? '3.25rem' : size === 'md' ? '4.75rem' : '5.25rem';
  const mergedStyle: React.CSSProperties | undefined = {
    ...(props.style as React.CSSProperties | undefined),
    ...(isLanguageSelector ? { paddingRight: caretPadRight } : {}),
  };
  return (
    <div className={(fullWidth || isLanguageSelector) ? "w-full" : ""}>
      {label && (
        <motion.label
          htmlFor={selectId}
          className={`
            block text-sm font-medium mb-2 transition-colors duration-fast
            ${error
              ? "text-error-600 dark:text-error-400"
              : isFocused
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-700 dark:text-gray-300"
            }
          `}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      <div className={`relative select-container form-control ${isLanguageSelector ? 'language-selector overflow-visible' : ''}`}>
        <motion.select
          id={selectId}
          className={combinedClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
          style={mergedStyle}
          {...(props as any)}
        >
          {placeholder && (
            <option value="" disabled className="text-gray-400">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={`
                py-2 px-3 text-gray-900 dark:text-gray-100
                bg-white dark:bg-gray-800
                ${isLanguageSelector ? "" : "text-ellipsis overflow-hidden whitespace-nowrap"}
                ${option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
              `}
            >
              {option.label}
            </option>
          ))}
        </motion.select>
        {/* Custom dropdown arrow */}
        <div className={`absolute inset-y-0 ${arrowPosition[size]} flex items-center pointer-events-none z-10`}>
          <motion.div
            animate={{ rotate: isFocused ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <CaretDown
              className={`
                ${arrowSize[size]}
                ${error
                  ? "text-error-500"
                  : isFocused
                    ? "text-primary-500"
                    : "text-gray-400 dark:text-gray-500"
                }
                transition-colors duration-fast
              `}
              weight="bold"
            />
          </motion.div>
        </div>
        {/* Focus indicator line for outlined variant */}
        {variant === "outlined" && (
          <motion.div
            className={`
              absolute bottom-0 left-0 h-0.5 bg-primary-600
              ${isFocused ? "w-full" : "w-0"}
            `}
            initial={{ width: 0 }}
            animate={{ width: isFocused ? "100%" : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
      {error && (
        <motion.p
          className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <motion.p
          className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          {helperText}
        </motion.p>
      )}
    </div>
  );
}
