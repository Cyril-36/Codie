import { motion, useReducedMotion as framerUseReducedMotion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  durationMs?: number;
  interactive?: boolean;
}

const variantStyles: Record<ToastVariant, { bg: string; fg: string; border: string; icon: string }> = {
  success: { bg: 'var(--success-bg)', fg: 'var(--foreground)', border: 'var(--success-border)', icon: '✅' },
  warning: { bg: 'var(--warning-bg)', fg: 'var(--foreground)', border: 'var(--warning-border)', icon: '⚠️' },
  error:   { bg: 'var(--error-bg)',   fg: 'var(--foreground)', border: 'var(--error-border)',   icon: '❌' },
  info:    { bg: 'var(--info-bg)',    fg: 'var(--foreground)', border: 'var(--info-border)',    icon: 'ℹ️' },
};

export default function Toast({
  id: _id,
  variant = 'info',
  title,
  message,
  onClose,
  durationMs = 4000,
  interactive = false,
}: ToastProps) {
  const prefersReducedMotion = framerUseReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-dismiss for non-interactive toasts
    if (!interactive && durationMs && onClose) {
      const t = window.setTimeout(onClose, durationMs);
      return () => window.clearTimeout(t);
    }
  }, [interactive, durationMs, onClose]);

  useEffect(() => {
    // Focus management for interactive toasts
    if (interactive && ref.current) {
      ref.current.setAttribute('tabindex', '-1');
      ref.current.focus();
    }
    // ESC-to-dismiss for interactive toasts
    const onKeyDown = (e: KeyboardEvent) => {
      if (interactive && e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [interactive, onClose]);

  const { bg, fg, border, icon } = variantStyles[variant];
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status';

  return (
    <motion.div
      ref={ref}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className="rounded-lg p-4 border shadow-md"
      style={{ background: bg, color: fg, borderColor: border, outline: 'none' }}
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
        <div className="flex-1 min-w-0">
          {title && <div className="font-medium mb-0.5">{title}</div>}
          <div className="text-sm">{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="icon-button p-1 rounded focus-ring"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
