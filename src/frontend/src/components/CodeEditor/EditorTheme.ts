/**
 * Monaco Editor Theme Configuration
 * Matches the design system specifications exactly
 */
import type * as monaco from 'monaco-editor';

// Design system color constants
export const EDITOR_COLORS = {
  // Background colors
  background: '#1E293B',        // Exact specification from design system
  foreground: '#E2E8F0',        // Main text color
  // Syntax highlighting colors (exact specifications)
  keyword: '#7DD3FC',           // Keywords (sky-300)
  string: '#86EFAC',            // Strings (green-300)
  comment: '#64748B',           // Comments (slate-500)
  function: '#A78BFA',          // Functions (violet-300)
  number: '#FBBF24',            // Numbers (amber-400)
  // Additional syntax colors
  type: '#F472B6',              // Types (pink-300)
  variable: '#FDE047',          // Variables (yellow-300)
  operator: '#FB7185',          // Operators (rose-300)
  punctuation: '#CBD5E1',       // Punctuation (slate-300)
  // UI colors
  selection: '#3B82F6',         // Selection background (blue-500)
  selectionHighlight: '#1E40AF', // Selection highlight (blue-800)
  lineHighlight: '#334155',     // Current line highlight (slate-700)
  // Gutter colors
  lineNumber: '#64748B',        // Line numbers (slate-500)
  lineNumberActive: '#94A3B8',  // Active line number (slate-400)
  // Editor chrome
  border: '#475569',            // Borders (slate-600)
  scrollbar: '#475569',         // Scrollbar (slate-600)
  scrollbarHover: '#64748B',    // Scrollbar hover (slate-500)
} as const;
// Monaco Editor Theme Definition
export const codieEditorTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // Keywords
    { token: 'keyword', foreground: EDITOR_COLORS.keyword.replace('#', ''), fontStyle: 'bold' },
    { token: 'keyword.control', foreground: EDITOR_COLORS.keyword.replace('#', ''), fontStyle: 'bold' },
    { token: 'keyword.operator', foreground: EDITOR_COLORS.operator.replace('#', '') },
    // Strings
    { token: 'string', foreground: EDITOR_COLORS.string.replace('#', '') },
    { token: 'string.quoted', foreground: EDITOR_COLORS.string.replace('#', '') },
    { token: 'string.template', foreground: EDITOR_COLORS.string.replace('#', '') },
    // Comments
    { token: 'comment', foreground: EDITOR_COLORS.comment.replace('#', ''), fontStyle: 'italic' },
    { token: 'comment.line', foreground: EDITOR_COLORS.comment.replace('#', ''), fontStyle: 'italic' },
    { token: 'comment.block', foreground: EDITOR_COLORS.comment.replace('#', ''), fontStyle: 'italic' },
    // Functions
    { token: 'entity.name.function', foreground: EDITOR_COLORS.function.replace('#', ''), fontStyle: 'bold' },
    { token: 'support.function', foreground: EDITOR_COLORS.function.replace('#', '') },
    { token: 'meta.function-call', foreground: EDITOR_COLORS.function.replace('#', '') },
    // Numbers
    { token: 'constant.numeric', foreground: EDITOR_COLORS.number.replace('#', '') },
    { token: 'number', foreground: EDITOR_COLORS.number.replace('#', '') },
    // Types
    { token: 'entity.name.type', foreground: EDITOR_COLORS.type.replace('#', ''), fontStyle: 'bold' },
    { token: 'support.type', foreground: EDITOR_COLORS.type.replace('#', '') },
    { token: 'storage.type', foreground: EDITOR_COLORS.type.replace('#', '') },
    // Variables
    { token: 'variable', foreground: EDITOR_COLORS.variable.replace('#', '') },
    { token: 'variable.parameter', foreground: EDITOR_COLORS.variable.replace('#', '') },
    { token: 'variable.other', foreground: EDITOR_COLORS.variable.replace('#', '') },
    // Operators
    { token: 'keyword.operator.arithmetic', foreground: EDITOR_COLORS.operator.replace('#', '') },
    { token: 'keyword.operator.comparison', foreground: EDITOR_COLORS.operator.replace('#', '') },
    { token: 'keyword.operator.logical', foreground: EDITOR_COLORS.operator.replace('#', '') },
    // Punctuation
    { token: 'punctuation', foreground: EDITOR_COLORS.punctuation.replace('#', '') },
    { token: 'punctuation.definition', foreground: EDITOR_COLORS.punctuation.replace('#', '') },
    { token: 'punctuation.separator', foreground: EDITOR_COLORS.punctuation.replace('#', '') },
    // Language-specific tokens
    // JavaScript/TypeScript
    { token: 'support.class.builtin.js', foreground: EDITOR_COLORS.type.replace('#', '') },
    { token: 'variable.language.this', foreground: EDITOR_COLORS.keyword.replace('#', ''), fontStyle: 'italic' },
    // Python
    { token: 'support.function.builtin.python', foreground: EDITOR_COLORS.function.replace('#', '') },
    { token: 'constant.language.python', foreground: EDITOR_COLORS.keyword.replace('#', '') },
    // HTML
    { token: 'entity.name.tag', foreground: EDITOR_COLORS.keyword.replace('#', ''), fontStyle: 'bold' },
    { token: 'entity.other.attribute-name', foreground: EDITOR_COLORS.function.replace('#', '') },
    // CSS
    { token: 'support.type.property-name.css', foreground: EDITOR_COLORS.function.replace('#', '') },
    { token: 'constant.other.color.rgb-value.css', foreground: EDITOR_COLORS.number.replace('#', '') },
    // JSON
    { token: 'support.type.property-name.json', foreground: EDITOR_COLORS.function.replace('#', '') },
    // Markdown
    { token: 'markup.heading', foreground: EDITOR_COLORS.keyword.replace('#', ''), fontStyle: 'bold' },
    { token: 'markup.bold', fontStyle: 'bold' },
    { token: 'markup.italic', fontStyle: 'italic' },
  ],
  colors: {
    // Editor background
    'editor.background': EDITOR_COLORS.background,
    'editor.foreground': EDITOR_COLORS.foreground,
    // Selection
    'editor.selectionBackground': EDITOR_COLORS.selection + '40', // 25% opacity
    'editor.selectionHighlightBackground': EDITOR_COLORS.selectionHighlight + '30', // 19% opacity
    'editor.inactiveSelectionBackground': EDITOR_COLORS.selection + '20', // 12% opacity
    // Current line
    'editor.lineHighlightBackground': EDITOR_COLORS.lineHighlight + '50', // 31% opacity
    'editor.lineHighlightBorder': 'transparent',
    // Line numbers
    'editorLineNumber.foreground': EDITOR_COLORS.lineNumber,
    'editorLineNumber.activeForeground': EDITOR_COLORS.lineNumberActive,
    // Cursor
    'editorCursor.foreground': EDITOR_COLORS.foreground,
    // Whitespace
    'editorWhitespace.foreground': EDITOR_COLORS.comment + '60', // 38% opacity
    // Indentation guides
    'editorIndentGuide.background': EDITOR_COLORS.comment + '40', // 25% opacity
    'editorIndentGuide.activeBackground': EDITOR_COLORS.comment + '80', // 50% opacity
    // Rulers
    'editorRuler.foreground': EDITOR_COLORS.border + '60', // 38% opacity
    // Brackets
    'editorBracketMatch.background': EDITOR_COLORS.selection + '40', // 25% opacity
    'editorBracketMatch.border': EDITOR_COLORS.selection,
    // Find/replace
    'editor.findMatchBackground': EDITOR_COLORS.number + '60', // 38% opacity
    'editor.findMatchHighlightBackground': EDITOR_COLORS.number + '40', // 25% opacity
    'editor.findRangeHighlightBackground': EDITOR_COLORS.selection + '20', // 12% opacity
    // Scrollbar
    'scrollbar.shadow': EDITOR_COLORS.background,
    'scrollbarSlider.background': EDITOR_COLORS.scrollbar + '60', // 38% opacity
    'scrollbarSlider.hoverBackground': EDITOR_COLORS.scrollbarHover + '80', // 50% opacity
    'scrollbarSlider.activeBackground': EDITOR_COLORS.scrollbarHover,
    // Minimap
    'minimap.background': EDITOR_COLORS.background,
    'minimap.selectionHighlight': EDITOR_COLORS.selection,
    'minimap.findMatchHighlight': EDITOR_COLORS.number,
    // Overview ruler
    'editorOverviewRuler.background': EDITOR_COLORS.background,
    'editorOverviewRuler.border': EDITOR_COLORS.border,
    // Gutter
    'editorGutter.background': EDITOR_COLORS.background,
    // Error/warning squiggles
    'editorError.foreground': '#EF4444', // error-500
    'editorWarning.foreground': '#F59E0B', // warning-500
    'editorInfo.foreground': '#3B82F6', // info-500
    // Hover
    'editorHoverWidget.background': EDITOR_COLORS.background,
    'editorHoverWidget.border': EDITOR_COLORS.border,
    'editorHoverWidget.foreground': EDITOR_COLORS.foreground,
    // Suggest widget
    'editorSuggestWidget.background': EDITOR_COLORS.background,
    'editorSuggestWidget.border': EDITOR_COLORS.border,
    'editorSuggestWidget.foreground': EDITOR_COLORS.foreground,
    'editorSuggestWidget.selectedBackground': EDITOR_COLORS.selection + '40', // 25% opacity
    'editorSuggestWidget.highlightForeground': EDITOR_COLORS.keyword,
  },
};
// Editor configuration options
export const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  // Theme
  theme: 'codie-dark',
  // Font settings
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  fontSize: 14,
  fontWeight: '400',
  lineHeight: 1.6,
  letterSpacing: 0.5,
  fontLigatures: true,
  // Editor behavior
  automaticLayout: true,
  wordWrap: 'on',
  wordWrapColumn: 120,
  wrappingIndent: 'indent',
  // Line numbers
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  // Minimap
  minimap: {
    enabled: true,
    side: 'right',
    size: 'proportional',
    showSlider: 'mouseover',
    renderCharacters: true,
    maxColumn: 120,
  },
  // Scrolling
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  mouseWheelScrollSensitivity: 1,
  fastScrollSensitivity: 5,
  // Selection
  selectionHighlight: true,
  occurrencesHighlight: 'multiFile',
  // Indentation
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  // Brackets
  matchBrackets: 'always',
  bracketPairColorization: {
    enabled: true,
  },
  // Folding
  folding: true,
  foldingStrategy: 'indentation',
  showFoldingControls: 'mouseover' as const,
  // Find
  find: {
    addExtraSpaceOnTop: false,
    autoFindInSelection: 'never',
    seedSearchStringFromSelection: 'always',
  },
  // Hover
  hover: {
    enabled: true,
    delay: 300,
    sticky: true,
  },
  // Suggestions
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  acceptSuggestionOnCommitCharacter: true,
  // Accessibility
  accessibilitySupport: 'auto',
  // Performance
  renderWhitespace: 'selection',
  renderControlCharacters: false,
  guides: {
    indentation: true,
  },
  renderLineHighlight: 'line',
  renderValidationDecorations: 'on',
  // Scrollbar
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 14,
  },
  // Overview ruler
  overviewRulerLanes: 3,
  overviewRulerBorder: false,
  // Context menu
  contextmenu: true,
  // Multi-cursor
  multiCursorModifier: 'alt',
  multiCursorMergeOverlapping: true,
  // Links
  links: true,
  // Color decorators
  colorDecorators: true,
  // Code lens
  codeLens: true,
  // Rulers
  rulers: [80, 120],
  // Drag and drop
  dragAndDrop: true,
  // Copy with syntax highlighting
  copyWithSyntaxHighlighting: true,
  // Sticky scroll
  stickyScroll: {
    enabled: false,
  },
  // Padding
  padding: {
    top: 16,
    bottom: 16,
  },
};
// Language-specific configurations
export const languageConfigurations = {
  javascript: {
    ...editorOptions,
    tabSize: 2,
  },
  typescript: {
    ...editorOptions,
    tabSize: 2,
  },
  python: {
    ...editorOptions,
    tabSize: 4,
    insertSpaces: true,
  },
  java: {
    ...editorOptions,
    tabSize: 4,
  },
  cpp: {
    ...editorOptions,
    tabSize: 4,
  },
  csharp: {
    ...editorOptions,
    tabSize: 4,
  },
  go: {
    ...editorOptions,
    tabSize: 4,
    insertSpaces: false, // Go uses tabs
  },
  rust: {
    ...editorOptions,
    tabSize: 4,
  },
  php: {
    ...editorOptions,
    tabSize: 4,
  },
  ruby: {
    ...editorOptions,
    tabSize: 2,
  },
  html: {
    ...editorOptions,
    tabSize: 2,
    wordWrap: 'on',
  },
  css: {
    ...editorOptions,
    tabSize: 2,
  },
  json: {
    ...editorOptions,
    tabSize: 2,
  },
  yaml: {
    ...editorOptions,
    tabSize: 2,
  },
  markdown: {
    ...editorOptions,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'off',
    minimap: { enabled: false },
  },
};
export default {
  codieEditorTheme,
  editorOptions,
  languageConfigurations,
  EDITOR_COLORS,
};
