import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// Some versions of vite-plugin-monaco-editor export the plugin as a named export, others as default.
// To be robust across versions, import the module and normalize to a callable.
import monacoPluginModule from "vite-plugin-monaco-editor";

const monacoPlugin: any =
  // ESM default export case
  (monacoPluginModule as any)?.default?.call
    ? (monacoPluginModule as any).default
    : // CommonJS module.exports = function case
    (typeof monacoPluginModule === "function"
      ? (monacoPluginModule as any)
      : // Named export case: { monacoEditorPlugin }
        (monacoPluginModule as any).monacoEditorPlugin);

export default defineConfig({
  // @ts-ignore - plugin typing varies across versions
  plugins: [react(), monacoPlugin({ languages: ["javascript", "typescript", "python"] })],
  server: {
    port: 5174,
  },
});
