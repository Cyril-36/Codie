/* ESLint v9 Flat Config for Vite + React + TypeScript */
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".vite/**",
      "**/*.min.js",
      "scripts/**",
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // React + JSX
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: false,
        tsconfigRootDir: undefined,
      },
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        Blob: "readonly",
        URL: "readonly",
        HTMLElement: "readonly",
        TextEncoder: "readonly",
        JSX: "readonly",
        KeyboardEvent: "readonly",
        // Browser/runtime globals commonly used
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        performance: "readonly",
        FormData: "readonly",
        File: "readonly",
        WebSocket: "readonly",
        MutationObserver: "readonly",
        Element: "readonly",
        Event: "readonly",
        MouseEvent: "readonly",
        Node: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      react: reactPlugin,
      "react-hooks": reactHooks,
      import: importPlugin,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: true,
      },
    },
    rules: {
      // TypeScript
      "no-unused-vars": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],

      // React
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Imports
      "import/order": [
        "warn",
        {
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "off", // TS handles this

      // Accessibility
      "jsx-a11y/aria-role": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/no-autofocus": "off",
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",

      // General
      // Let TypeScript handle undefined variables/types
      "no-undef": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "warn",
    },
  },

  // File-specific overrides for false positives
  {
    files: ["src/components/CodeEditor.tsx"],
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["src/hooks/useAuth.ts"],
    rules: {
      "no-unused-vars": "off",
    },
  },
  // Temporarily relax strictness for demo/testing-only showcase files
  {
    files: [
      "src/components/Testing/**",
      "src/pages/TestPage.tsx",
    ],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Provide vitest globals in test files
  {
    files: [
      "src/__tests__/**",
      "src/test-setup.ts",
    ],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        vi: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];
