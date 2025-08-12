import { AnimatePresence, motion } from "framer-motion";
import { X } from "phosphor-react";
import React, { useEffect, useRef } from "react";
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
}
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
  overlayClassName = "",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);
  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  // Size classes
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };
  // Enhanced animation variants with new motion system
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
    },
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-modal">
          {/* Enhanced Overlay with new motion classes */}
          <motion.div
            className={`
              fixed inset-0 bg-black/50 backdrop-blur-sm modal-overlay
              ${overlayClassName}
            `}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />
          {/* Modal container */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              className={`
                relative w-full ${sizeClasses[size]}
                bg-white dark:bg-gray-800 rounded-xl shadow-xl
                max-h-[90vh] overflow-hidden
                focus:outline-none
                ${className}
              `}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ 
                duration: 0.3,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              tabIndex={-1}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  {title && (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="
                        p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                        dark:hover:text-gray-300 dark:hover:bg-gray-700
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-primary-500
                      "
                      aria-label="Close modal"
                    >
                      <X size={20} weight="bold" />
                    </button>
                  )}
                </div>
              )}
              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
// Modal Header Component
export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalHeader({ children, className = "" }: ModalHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
// Modal Body Component
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
// Modal Footer Component
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}
export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 ${className}`}>
      {children}
    </div>
  );
}
// Confirmation Modal Component
export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };
  const confirmButtonClass = variant === "danger" 
    ? "bg-error-600 hover:bg-error-700 text-white"
    : "bg-primary-600 hover:bg-primary-700 text-white";
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </ModalHeader>
      <ModalBody>
        <p className="text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </ModalBody>
      <ModalFooter>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700
            "
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${confirmButtonClass}
            `}
          >
            {loading ? "Loading..." : confirmText}
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
