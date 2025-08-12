import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

// Premium Design System Color Palette
const PALETTE = {
  // Brand Colors - Purple/Blue Gradient
  brandPrimary: "#7c3aed",        // Electric purple
  brandSecondary: "#2563eb",      // Bright blue
  brandAccent: "#ec4899",         // Hot pink accent
  
  // Dark Mode Colors
  bgPrimaryDark: "#0a0a0f",       // Deep space black
  bgSecondaryDark: "#111118",     // Elevated surface
  bgTertiaryDark: "#1a1a24",      // Card background
  bgHoverDark: "#21212e",         // Hover state
  bgSelectedDark: "#2a2a3e",      // Selected items
  
  // Light Mode Colors
  bgPrimaryLight: "#ffffff",      // Pure white
  bgSecondaryLight: "#f9fafb",    // Off white
  bgTertiaryLight: "#f3f4f6",     // Light gray
  bgHoverLight: "#e5e7eb",        // Hover state
  bgSelectedLight: "#ddd6fe",     // Purple tint
  
  // Text Colors
  textPrimaryLight: "#111827",    // Near black
  textSecondaryLight: "#4b5563",  // Medium gray
  textTertiaryLight: "#9ca3af",   // Light gray
  textPrimaryDark: "#f9fafb",     // Pure white
  textSecondaryDark: "#9ca3af",   // Muted gray
  textTertiaryDark: "#6b7280",    // Subtle gray
  
  // Semantic Colors
  success: "#10b981",              // Emerald green
  successDark: "#059669",          // Darker green for contrast
  warning: "#f59e0b",              // Amber
  warningDark: "#d97706",          // Darker amber
  error: "#ef4444",                // Bright red
  errorDark: "#dc2626",            // Darker red
  info: "#06b6d4",                 // Cyan
  infoDark: "#0891b2",             // Darker cyan
  
  // Code Highlighting
  codeKeyword: "#c084fc",          // Purple
  codeString: "#86efac",           // Green
  codeFunction: "#67e8f9",         // Cyan
  codeComment: "#64748b",          // Gray
  codeVariable: "#fbbf24",         // Yellow
};

// Design tokens
export const designTokens = {
  spacing: {
    xs: "0.5rem",    // 8px
    sm: "0.75rem",   // 12px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },
  borderRadius: {
    sm: "0.375rem",  // 6px
    md: "0.5rem",    // 8px
    lg: "0.75rem",   // 12px
    xl: "1rem",      // 16px
    "2xl": "1.5rem", // 24px
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "Consolas", "Monaco", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",   // 12px
      sm: "0.875rem",  // 14px
      base: "1rem",    // 16px
      lg: "1.125rem",  // 18px
      xl: "1.25rem",   // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem",  // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
};

type ThemeMode = "light" | "dark" | "system";
type ResolvedThemeMode = "light" | "dark";

interface ThemeContextType {
  // Current theme state
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  // Theme controls
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  // System preference detection
  systemPreference: ResolvedThemeMode;
  // Theme data
  palette: typeof PALETTE;
  tokens: typeof designTokens;
  // Utilities
  isDark: boolean;
  isLight: boolean;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Hook to detect system preference
function useSystemTheme(): ResolvedThemeMode {
  const [systemTheme, setSystemTheme] = useState<ResolvedThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return systemTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get stored theme preference or default to system
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem("codie-theme") as ThemeMode;
    return stored || "system";
  });

  // Detect system preference
  const systemPreference = useSystemTheme();

  // Resolve the actual theme to apply
  const resolvedMode: ResolvedThemeMode = useMemo(() => {
    return mode === "system" ? systemPreference : mode;
  }, [mode, systemPreference]);

  // Update localStorage and DOM when theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // eslint-disable-next-line no-console
    console.log('Theme useEffect triggered:', { mode, resolvedMode });
    
    localStorage.setItem("codie-theme", mode);
    
    // Update document classes and data attributes
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    root.removeAttribute("data-theme");
    
    // Add new theme
    root.classList.add(resolvedMode);
    root.setAttribute("data-theme", resolvedMode);
    
    // eslint-disable-next-line no-console
    console.log('Applied theme classes:', root.className);
    // eslint-disable-next-line no-console
    console.log('Applied data-theme:', root.getAttribute('data-theme'));
    
    // Update CSS custom properties for smooth transitions
    root.style.setProperty("--theme-transition", "background-color 200ms ease, border-color 200ms ease, color 200ms ease");
  }, [mode, resolvedMode]);

  // Theme control functions
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const toggle = useCallback(() => {
    setModeState(current => {
      if (current === "system") return "light";
      if (current === "light") return "dark";
      return "light";
    });
  }, []);

  // Create context value
  const value = useMemo<ThemeContextType>(() => ({
    mode,
    resolvedMode,
    setMode,
    toggle,
    systemPreference,
    palette: PALETTE,
    tokens: designTokens,
    isDark: resolvedMode === "dark",
    isLight: resolvedMode === "light",
    isSystem: mode === "system",
  }), [mode, resolvedMode, setMode, toggle, systemPreference]);

  return React.createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Additional theme utility hooks
export function useIsDark(): boolean {
  const { isDark } = useTheme();
  return isDark;
}

export function useIsLight(): boolean {
  const { isLight } = useTheme();
  return isLight;
}

export function useResolvedTheme(): ResolvedThemeMode {
  const { resolvedMode } = useTheme();
  return resolvedMode;
}

export function useSystemPreference(): ResolvedThemeMode {
  const { systemPreference } = useTheme();
  return systemPreference;
}

export { PALETTE };
