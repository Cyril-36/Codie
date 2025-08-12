import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState, useCallback } from "react";
export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  disabled?: boolean;
  className?: string;
  arrow?: boolean;
}
export default function Tooltip({
  children,
  content,
  placement = "top",
  delay = 200,
  disabled = false,
  className = "",
  arrow = true,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const showTooltip = () => {
    if (disabled) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    let x = 0;
    let y = 0;
    switch (placement) {
      case "top":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case "bottom":
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case "right":
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }
    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));
    setPosition({ x, y });
  }, [placement]);
  useEffect(() => {
    updatePosition();
  }, [updatePosition]);
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isVisible, updatePosition]);
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  // Arrow component
  const Arrow = ({ placement }: { placement: string }) => {
    const arrowClasses = {
      top: "bottom-[-4px] left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900",
      bottom: "top-[-4px] left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900",
      left: "right-[-4px] top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900",
      right: "left-[-4px] top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900",
    };
    return <div className={`absolute w-0 h-0 ${arrowClasses[placement as keyof typeof arrowClasses]}`} />;
  };
  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`
              fixed z-tooltip pointer-events-none
              bg-gray-900 text-white text-sm font-medium
              px-3 py-2 rounded-lg shadow-lg
              max-w-xs break-words
              ${className}
            `}
            style={{
              left: position.x,
              top: position.y,
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {content}
            {arrow && <Arrow placement={placement} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
