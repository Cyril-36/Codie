import { AnimatePresence } from 'framer-motion';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import Toast, { type ToastVariant } from './Toast';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  interactive?: boolean;
  durationMs?: number;
}

interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `t_${Date.now()}_${counter.current++}`;
    setToasts(prev => [...prev, { id, ...toast }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  // ESC closes the topmost toast if any interactive or any toast is present
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        // Close last (topmost)
        setToasts(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toasts.length]);

  const value = useMemo(() => ({ show, dismiss, dismissAll }), [show, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Portal container */}
      <div aria-live="polite" aria-relevant="additions" className="fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-2 px-4 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto w-full max-w-md">
              <Toast
                variant={t.variant}
                title={t.title}
                message={t.message}
                interactive={t.interactive}
                durationMs={t.durationMs}
                onClose={() => dismiss(t.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
