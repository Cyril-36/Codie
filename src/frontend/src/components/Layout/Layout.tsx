import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

// Hook for responsive breakpoint detection
function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  
  return { breakpoint, windowSize, isMobile: breakpoint === "mobile" };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { breakpoint, isMobile } = useResponsive();
  const mainRef = useRef<HTMLElement | null>(null);
  
  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Focus management: move focus to main region on route changes
  useEffect(() => {
    // slight delay to ensure content is present
    const id = window.setTimeout(() => {
      const heading = document.querySelector('main h1, main [role="heading"]') as HTMLElement | null;
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      } else if (mainRef.current) {
        mainRef.current.setAttribute('tabindex', '-1');
        mainRef.current.focus();
      }
    }, 50);
    return () => window.clearTimeout(id);
  });

  // Layout variants for different breakpoints
  const _layoutVariants = {
    desktop: {
      gridTemplateColumns: "256px 1fr", // sidebar width + main content
      gap: "0px",
    },
    tablet: {
      gridTemplateColumns: "1fr",
      gap: "0px",
    },
    mobile: {
      gridTemplateColumns: "1fr",
      gap: "0px",
    },
  };

  return (
    <div className="min-h-screen bg-bg-primary transition-all duration-300">
      {/* Global Header - Fixed */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      {/* Main Layout Container */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Always visible on desktop */}
        {breakpoint === "desktop" && (
          <motion.div
            className="fixed top-0 left-0 h-full z-40 mt-16 md:mt-14"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Sidebar open={true} />
          </motion.div>
        )}
        
        {/* Mobile/Tablet Sidebar - Overlay */}
        {breakpoint !== "desktop" && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        {/* Main Content Area */}
        <motion.main
          ref={mainRef}
          className={`
            flex-1 transition-all duration-300
            ${breakpoint === "desktop" ? "ml-64" : "ml-0"}
            pt-16 md:pt-14
          `}
          layout
        >
          {/* Content Container with responsive max-width */}
          <div className="
            max-w-7xl mx-auto h-full
            px-6 md:px-12 py-6 md:py-8
          ">
            <motion.div
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}

// Enhanced Two Column Layout with premium styling
export function TwoColumnLayout({
  leftPanel,
  rightPanel,
  leftWidth = "60%",
  rightWidth = "40%",
  gap = "24px",
  className = ""
}: {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftWidth?: string;
  rightWidth?: string;
  gap?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`grid gap-6 ${className}`}
      style={{
        gridTemplateColumns: `${leftWidth} ${rightWidth}`,
        gap: gap,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Left Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      >
        {leftPanel}
      </motion.div>
      
      {/* Right Panel */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      >
        {rightPanel}
      </motion.div>
    </motion.div>
  );
}

// Enhanced Single Column Layout with premium styling
export function SingleColumnLayout({
  children,
  maxWidth = "4xl",
  className = ""
}: {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
}) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <motion.div
      className={`mx-auto ${maxWidthClasses[maxWidth]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Grid Layout with premium styling
export function GridLayout({
  children,
  columns = 1,
  gap = "24px",
  className = ""
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: string;
  className?: string;
}) {
  const gridColsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
  };

  return (
    <motion.div
      className={`grid ${gridColsClasses[columns]} gap-6 ${className}`}
      style={{ gap: gap }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
