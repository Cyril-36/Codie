import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Shield,
  PaintBrush,
  TestTube,
  Lightning,
  ArrowsClockwise,
  Graph,
  ChatCircle,
  ClockCounterClockwise,
  Gear,
  X
} from "phosphor-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    name: "Code Analysis",
    href: "/",
    icon: Code,
    description: "Analyze code quality and structure"
  },
  {
    name: "Security Scan",
    href: "/security",
    icon: Shield,
    description: "Scan for security vulnerabilities"
  },
  {
    name: "Style Check",
    href: "/style",
    icon: PaintBrush,
    description: "Check code style and formatting"
  },
  {
    name: "Test Generator",
    href: "/test-gen",
    icon: TestTube,
    description: "Generate unit tests automatically"
  },
  {
    name: "Performance",
    href: "/performance",
    icon: Lightning,
    description: "Analyze performance metrics"
  },
  {
    name: "Refactor Plan",
    href: "/refactor",
    icon: ArrowsClockwise,
    description: "Get refactoring suggestions"
  },
  {
    name: "Code Graph",
    href: "/graph",
    icon: Graph,
    description: "Visualize code dependencies"
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: ChatCircle,
    description: "Chat with AI about your code"
  },
  {
    name: "History",
    href: "/history",
    icon: ClockCounterClockwise,
    description: "View analysis history"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Gear,
    description: "Configure application settings"
  },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const location = useLocation();

  // Enhanced animation variants with premium motion system
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {open && onClose && (
          <motion.div
            className="fixed inset-0 bg-bg-primary/50 backdrop-blur-sm z-30 md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="
          sidebar-surface
          fixed top-0 left-0 w-64 z-40
          bg-bg-secondary text-text-secondary
          border-r border-border-default
          shadow-xl flex flex-col sidebar
          mt-16 md:mt-14
          h-[calc(100vh-4rem)] md:h-[calc(100vh-3.5rem)]
        "
        style={{ width: '16rem' }}
        variants={sidebarVariants}
        initial="closed"
        animate={open ? "open" : "closed"}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border-default min-h-[3.5rem]">
          <motion.h2
            className="text-xl font-bold text-text-primary leading-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Navigation
          </motion.h2>
          
          {/* Close Button for Mobile */}
          {onClose && (
            <motion.button
              onClick={onClose}
              className="
                p-2 rounded-lg text-text-secondary
                hover:text-text-primary hover:bg-bg-hover
                transition-all duration-300
                md:hidden
              "
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} weight="bold" />
            </motion.button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-scroll px-3 py-2 space-y-1">
          {navigationItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.name}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  to={item.href}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-300 ease-out
                    ${isActive
                      ? "bg-bg-selected text-foreground shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                    }
                    ${isActive ? 'item-active' : ''}
                  `}
                >
                  <motion.div
                    className={`
                      p-2 rounded-lg transition-all duration-300
                      ${isActive ? "bg-foreground/10 text-foreground" : "text-text-tertiary group-hover:text-primary"}
                    `}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={20} weight="bold" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <motion.p
                      className="font-medium text-sm truncate"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.name}
                    </motion.p>
                    <motion.p
                      className={`
                        text-xs truncate transition-all duration-300
                        ${isActive ? "text-white/80" : "text-text-tertiary"}
                      `}
                    >
                      {item.description}
                    </motion.p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Sidebar Footer - Removed */}
      </motion.aside>
    </>
  );
}
