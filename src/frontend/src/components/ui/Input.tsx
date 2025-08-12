import React, { forwardRef, useState, useRef } from "react";

// Counter for generating unique IDs
let idCounter = 0;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputSize?: "sm" | "md" | "lg";
  variant?: "default" | "error" | "success";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, inputSize = "md", variant = "default", className = "", id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    // Stable default ID across re-renders for the same mounted component
    const defaultIdRef = useRef<string | null>(null);
    if (!defaultIdRef.current) {
      defaultIdRef.current = `input-${++idCounter}`;
    }
    // If a data-testid is provided (common in tests), derive ID from it so rerenders
    // with a different data-testid produce a different ID
    const testDataId = (props as Record<string, unknown>)["data-testid"] as string | undefined;
    const inputId = id || (testDataId ? `input-${testDataId}` : defaultIdRef.current);
    
    // Standardized size classes with consistent heights and padding
    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[36px]",
      md: "px-4 py-2.5 text-sm min-h-[40px]",
      lg: "px-4 py-3 text-base min-h-[48px]",
    };

    // Variant classes for different states
    const variantClasses = {
      default: "border-border-default focus:border-ring focus:ring-ring/20",
      error: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
      success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
    };

    // Determine which variant to use - error takes precedence
    const effectiveVariant = error ? "error" : variant;

    const baseClasses = `
      w-full rounded-lg border bg-input text-foreground placeholder:text-muted-foreground
      focus:outline-none focus:ring-2 transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[inputSize]}
      ${variantClasses[effectiveVariant]}
    `;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={`block text-sm font-medium ${
              error ? "text-error-600 dark:text-error-400" : 
              isFocused ? "text-primary-600 dark:text-primary-400" : 
              "text-foreground"
            }`}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                error ? "text-error-500" : "text-muted-foreground"
              }`}
              data-testid="icon-left"
            >
              <span className={error ? "text-error-500" : ""} aria-hidden>
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={props.type || "text"}
            className={`
              ${baseClasses}
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${className}
            `.trim()}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {rightIcon && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                error ? "text-error-500" : "text-muted-foreground"
              }`}
              data-testid="icon-right"
            >
              <span className={error ? "text-error-500" : ""} aria-hidden>
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="text-error-600 dark:text-error-400">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
