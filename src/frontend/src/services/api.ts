import axios from "axios";

import { formatMemoryMB } from "../utils/formatters";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export type Suggestion = { message: string; confidence: number };
export type AnalyzeResponse = {
  ok: boolean;
  complexity: number;
  suggestions: Suggestion[];
  id?: number;
  created_at?: string;
};
export async function analyzeSnippet(language: string, content: string, showAll = false): Promise<AnalyzeResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  const mockSuggestions: Suggestion[] = [
    {
      message: "Consider using memoization to optimize recursive Fibonacci calculation. Use dynamic programming to improve time complexity from O(2^n) to O(n).",
      confidence: 0.9
    },
    {
      message: "Add type hints for better code documentation: def fibonacci(n: int) -> int:",
      confidence: 0.8
    },
    {
      message: "Add input validation for negative numbers: if n < 0: raise ValueError('n must be non-negative')",
      confidence: 0.7
    }
  ];

  return {
    ok: true,
    complexity: 8,
    suggestions: showAll ? mockSuggestions : mockSuggestions.slice(0, 2)
  };
}
export type HistoryItem = {
  id: number;
  language: string;
  complexity: number;
  created_at: string;
};
export type HistoryResponse = {
  items: HistoryItem[];
  total: number;
  page: number;
  size: number;
};
export async function fetchHistory(page = 1, size = 10): Promise<HistoryResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay

  const mockItems: HistoryItem[] = [
    { id: 1, language: "Python", complexity: 8.5, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, language: "JavaScript", complexity: 6.2, created_at: "2024-01-15T09:15:00Z" },
    { id: 3, language: "Java", complexity: 7.8, created_at: "2024-01-14T16:45:00Z" },
    { id: 4, language: "TypeScript", complexity: 5.9, created_at: "2024-01-14T14:20:00Z" },
    { id: 5, language: "Python", complexity: 9.1, created_at: "2024-01-13T11:30:00Z" },
    { id: 6, language: "JavaScript", complexity: 4.3, created_at: "2024-01-13T08:45:00Z" },
    { id: 7, language: "Java", complexity: 6.7, created_at: "2024-01-12T15:10:00Z" },
    { id: 8, language: "Python", complexity: 7.4, created_at: "2024-01-12T13:25:00Z" },
    { id: 9, language: "TypeScript", complexity: 5.1, created_at: "2024-01-11T10:15:00Z" },
    { id: 10, language: "JavaScript", complexity: 8.9, created_at: "2024-01-11T09:30:00Z" },
    { id: 11, language: "Python", complexity: 6.8, created_at: "2024-01-10T16:20:00Z" },
    { id: 12, language: "Java", complexity: 7.2, created_at: "2024-01-10T14:45:00Z" }
  ];

  // Simulate pagination
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;
  const paginatedItems = mockItems.slice(startIndex, endIndex);

  const mockResponse: HistoryResponse = {
    items: paginatedItems,
    total: mockItems.length,
    page: page,
    size: size
  };

  return mockResponse;
}
// File upload for analysis
export async function analyzeFile(file: File, language: string, showAll = false) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  const { data } = await api.post<AnalyzeResponse>("/api/v1/analyze-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    params: showAll ? { show_all: true } : {},
  });
  return data;
}

// Simple analyzeCode mock used by tests expecting this function
export async function analyzeCode(input: { name: string; content: string }) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 50));
  const isSecure = !/eval\(|innerHTML\s*=/.test(input.content);
  const length = input.content.length;
  const score = Math.max(0, Math.min(100, 100 - Math.floor(length / 50)));
  return {
    score,
    suggestions: isSecure ? [] : [{ id: 1, title: 'Avoid unsafe patterns', description: 'Detected potentially unsafe code' }],
    complexity: { cyclomatic: Math.max(1, Math.floor(length / 100)), cognitive: Math.max(1, Math.floor(length / 80)) },
    security: { vulnerabilities: isSecure ? [] : [{ severity: 'high', description: 'Unsafe pattern' }], score: isSecure ? 95 : 60 },
    style: { issues: [], score: Math.max(60, score) }
  } as any;
}
// Security scanning
export type SecurityRequest = {
  language: string;
  requirements?: string;
};
export type SecurityResponse = {
  vulnerabilities: Array<{
    package: string;
    severity: string;
    description: string;
    cve: string;
    version: string;
    fixed_in: string;
    patch: string;
    references: string[];
    // Enhanced fields for better accuracy
    cve_source: string;
    version_ranges: Array<{
      introduced: string;
      fixed: string;
      type: string;
    }>;
    affected_ecosystems: string[];
    cwe_ids: string[];
    attack_vector?: string;
    impact: {
      confidentiality?: string;
      integrity?: string;
      availability?: string;
    };
    published_date?: string;
    last_modified_date?: string;
  }>;
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  scanned_packages: number;
  scan_timestamp: string;
  language: string;
};
export async function scanSecurity(_request: SecurityRequest): Promise<SecurityResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate API delay

  const mockVulnerabilities = [
    {
      package: "flask",
      severity: "high",
      description: "Flask 1.1.2 has a known vulnerability CVE-2021-23385 that allows remote code execution through template injection.",
      cve: "CVE-2021-23385",
      version: "1.1.2",
      fixed_in: "2.0.0",
      patch: "pip install --upgrade flask",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2021-23385",
        "https://github.com/pallets/flask/security/advisories/GHSA-2qrx-6j3d-8h6h"
      ],
      cve_source: "NVD",
      version_ranges: [
        {
          introduced: "0.0.0",
          fixed: "2.0.0",
          type: "semver"
        }
      ],
      affected_ecosystems: ["PyPI"],
      cwe_ids: ["CWE-94"],
      attack_vector: "Network",
      impact: {
        confidentiality: "High",
        integrity: "High",
        availability: "High"
      },
      published_date: "2021-01-19T00:00:00Z",
      last_modified_date: "2021-01-19T00:00:00Z"
    },
    {
      package: "django",
      severity: "medium",
      description: "Django 3.1.0 has a potential SQL injection vulnerability in certain query conditions.",
      cve: "CVE-2021-44420",
      version: "3.1.0",
      fixed_in: "3.2.0",
      patch: "pip install --upgrade django",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2021-44420",
        "https://www.djangoproject.com/weblog/2021/dec/07/security-releases/"
      ],
      cve_source: "NVD",
      version_ranges: [
        {
          introduced: "3.1.0",
          fixed: "3.2.0",
          type: "semver"
        }
      ],
      affected_ecosystems: ["PyPI"],
      cwe_ids: ["CWE-89"],
      attack_vector: "Network",
      impact: {
        confidentiality: "Medium",
        integrity: "Medium",
        availability: "Low"
      },
      published_date: "2021-12-07T00:00:00Z",
      last_modified_date: "2021-12-07T00:00:00Z"
    },
    {
      package: "requests",
      severity: "low",
      description: "Requests 2.25.1 has a minor information disclosure issue in error messages.",
      cve: "CVE-2021-33503",
      version: "2.25.1",
      fixed_in: "2.26.0",
      patch: "pip install --upgrade requests",
      references: [
        "https://nvd.nist.gov/vuln/detail/CVE-2021-33503",
        "https://github.com/psf/requests/security/advisories/GHSA-xg9f-g7g7-2323"
      ],
      cve_source: "GHSA",
      version_ranges: [
        {
          introduced: "2.25.0",
          fixed: "2.26.0",
          type: "semver"
        }
      ],
      affected_ecosystems: ["PyPI"],
      cwe_ids: ["CWE-200"],
      attack_vector: "Network",
      impact: {
        confidentiality: "Low",
        integrity: "None",
        availability: "None"
      },
      published_date: "2021-06-01T00:00:00Z",
      last_modified_date: "2021-06-01T00:00:00Z"
    }
  ];

  return {
    vulnerabilities: mockVulnerabilities,
    summary: {
      total: 3,
      high: 1,
      medium: 1,
      low: 1
    },
    scanned_packages: 10,
    scan_timestamp: new Date().toISOString(),
    language: _request.language
  };
}
// Style checking
export type StyleRequest = {
  language: string;
  snippet: string;
};
export type StyleResponse = {
  style: Record<string, any>;
  issues: Array<{
    line: number;
    message: string;
    severity: string;
    rule?: string;
  }>;
  score: number;
};
export async function checkStyle(_request: StyleRequest): Promise<StyleResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  const mockIssues = [
    {
      line: 2,
      message: "Missing docstring for function 'calculate_total'",
      severity: "medium",
      rule: "missing-docstring"
    },
    {
      line: 7,
      message: "Line too long (82 > 79 characters)",
      severity: "low",
      rule: "line-too-long"
    },
    {
      line: 15,
      message: "Missing docstring for class 'ShoppingCart'",
      severity: "medium",
      rule: "missing-docstring"
    },
    {
      line: 18,
      message: "Missing docstring for method 'add_item'",
      severity: "low",
      rule: "missing-docstring"
    }
  ];

  const score = Math.max(0, 100 - (mockIssues.length * 15)); // Calculate score based on issues

  return {
    style: {
      language: _request.language,
      linesAnalyzed: _request.snippet.split('\n').length,
      rulesChecked: 25
    },
    issues: mockIssues,
    score: score
  };
}
// Test generation
export type TestGenRequest = {
  language: string;
  file?: string;
  code: string;
  function?: string;
};
export type TestGenResponse = {
  tests: string;
  framework: string;
  coverage: number;
};
export async function generateTests(_request: TestGenRequest): Promise<TestGenResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

  // Detect if the code contains Fibonacci function and generate appropriate tests
  const code = _request.code || '';
  const isFibonacci = code.includes('fibonacci') || code.includes('Fibonacci');
  const language = _request.language.toLowerCase();
  const isPython = language === 'python';
  const isJava = language === 'java';
  const isJavaScript = language === 'javascript' || language === 'js';
  
  let mockTests: string;
  let coverage: number;
  let framework: string;

  if (isFibonacci && isPython) {
    mockTests = `import pytest
from typing import Union


def fibonacci(n: int) -> int:
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)


class TestFibonacci:
    def test_fibonacci_base_cases(self):
        """Test base cases: fibonacci(0) and fibonacci(1)"""
        assert fibonacci(0) == 0
        assert fibonacci(1) == 1

    def test_fibonacci_small_numbers(self):
        """Test small positive numbers"""
        assert fibonacci(2) == 1
        assert fibonacci(3) == 2
        assert fibonacci(4) == 3
        assert fibonacci(5) == 5
        assert fibonacci(6) == 8

    def test_fibonacci_larger_numbers(self):
        """Test larger numbers"""
        assert fibonacci(10) == 55
        assert fibonacci(15) == 610

    def test_fibonacci_negative_input(self):
        """Test negative input handling"""
        with pytest.raises(RecursionError):
            fibonacci(-1)

    def test_fibonacci_performance(self):
        """Test that function completes in reasonable time"""
        import time
        start_time = time.time()
        result = fibonacci(20)
        execution_time = time.time() - start_time
        
        assert result == 6765
        assert execution_time < 1.0  # Should complete within 1 second

    def test_fibonacci_memoization_improvement(self):
        """Test that memoization would improve performance"""
        # This test demonstrates where memoization would help
        import time
        
        # First call
        start_time = time.time()
        fibonacci(25)
        first_call_time = time.time() - start_time
        
        # Second call (would be faster with memoization)
        start_time = time.time()
        fibonacci(25)
        second_call_time = time.time() - start_time
        
        # Both should complete
        assert first_call_time < 5.0
        assert second_call_time < 5.0`;
    
    coverage = 92;
    framework = "pytest";
  } else if (isFibonacci && isJava) {
    mockTests = `import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

public class FibonacciTest {
    
    @Test
    void testFibonacciBaseCases() {
        // Test base cases: fibonacci(0) and fibonacci(1)
        assertEquals(0, Fibonacci.fibonacci(0));
        assertEquals(1, Fibonacci.fibonacci(1));
    }
    
    @Test
    void testFibonacciSmallNumbers() {
        // Test small positive numbers
        assertEquals(1, Fibonacci.fibonacci(2));
        assertEquals(2, Fibonacci.fibonacci(3));
        assertEquals(3, Fibonacci.fibonacci(4));
        assertEquals(5, Fibonacci.fibonacci(5));
        assertEquals(8, Fibonacci.fibonacci(6));
    }
    
    @Test
    void testFibonacciLargerNumbers() {
        // Test larger numbers
        assertEquals(55, Fibonacci.fibonacci(10));
        assertEquals(610, Fibonacci.fibonacci(15));
    }
    
    @Test
    void testFibonacciNegativeInput() {
        // Test negative input handling
        assertThrows(IllegalArgumentException.class, () -> {
            Fibonacci.fibonacci(-1);
        });
    }
    
    @Test
    void testFibonacciPerformance() {
        // Test that function completes in reasonable time
        long startTime = System.currentTimeMillis();
        int result = Fibonacci.fibonacci(20);
        long executionTime = System.currentTimeMillis() - startTime;
        
        assertEquals(6765, result);
        assertTrue(executionTime < 1000, "Should complete within 1 second");
    }
    
    @Test
    void testFibonacciMemoizationImprovement() {
        // Test that memoization would improve performance
        long startTime = System.currentTimeMillis();
        Fibonacci.fibonacci(25);
        long firstCallTime = System.currentTimeMillis() - startTime;
        
        startTime = System.currentTimeMillis();
        Fibonacci.fibonacci(25);
        long secondCallTime = System.currentTimeMillis() - startTime;
        
        // Both should complete
        assertTrue(firstCallTime < 5000, "First call should complete within 5 seconds");
        assertTrue(secondCallTime < 5000, "Second call should complete within 5 seconds");
    }
}`;
    
    coverage = 92;
    framework = "JUnit 5";
  } else if (isFibonacci && isJavaScript) {
    mockTests = `// Test file for Fibonacci function
import { fibonacci } from './fibonacci';

describe('Fibonacci Function', () => {
  test('base cases: fibonacci(0) and fibonacci(1)', () => {
    expect(fibonacci(0)).toBe(0);
    expect(fibonacci(1)).toBe(1);
  });
  
  test('small positive numbers', () => {
    expect(fibonacci(2)).toBe(1);
    expect(fibonacci(3)).toBe(2);
    expect(fibonacci(4)).toBe(3);
    expect(fibonacci(5)).toBe(5);
    expect(fibonacci(6)).toBe(8);
  });
  
  test('larger numbers', () => {
    expect(fibonacci(10)).toBe(55);
    expect(fibonacci(15)).toBe(610);
  });
  
  test('negative input handling', () => {
    expect(() => fibonacci(-1)).toThrow();
  });
  
  test('performance within reasonable time', () => {
    const startTime = performance.now();
    const result = fibonacci(20);
    const executionTime = performance.now() - startTime;
    
    expect(result).toBe(6765);
    expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
  });
  
  test('memoization improvement potential', () => {
    const startTime = performance.now();
    fibonacci(25);
    const firstCallTime = performance.now() - startTime;
    
    const startTime2 = performance.now();
    fibonacci(25);
    const secondCallTime = performance.now() - startTime2;
    
    // Both should complete
    expect(firstCallTime).toBeLessThan(5000);
    expect(secondCallTime).toBeLessThan(5000);
  });
});`;
    
    coverage = 92;
    framework = "Jest";
  } else if (isFibonacci && !isPython && !isJava && !isJavaScript) {
    mockTests = `# Generic tests for ${_request.language}\n# Add your test cases here`;
    coverage = 70;
    framework = "Custom";
  } else if (language === 'python') {
    // Generic Python tests for other code
    mockTests = `import pytest


class TestCodeAnalysis:
    def test_basic_functionality(self):
        """Test basic functionality of the code"""
        # Add your test cases here based on the actual code
        assert True  # Placeholder assertion
        
    def test_edge_cases(self):
        """Test edge cases and boundary conditions"""
        # Add edge case tests here
        assert True  # Placeholder assertion
        
    def test_error_handling(self):
        """Test error handling and invalid inputs"""
        # Add error handling tests here
        assert True  # Placeholder assertion`;
    
    coverage = 75;
    framework = "pytest";
  } else if (language === 'java') {
    // Generic Java tests for other code
    mockTests = `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CodeAnalysisTest {
    
    @Test
    void testBasicFunctionality() {
        // Test basic functionality of the code
        // Add your test cases here based on the actual code
        assertTrue(true); // Placeholder assertion
    }
    
    @Test
    void testEdgeCases() {
        // Test edge cases and boundary conditions
        // Add edge case tests here
        assertTrue(true); // Placeholder assertion
    }
    
    @Test
    void testErrorHandling() {
        // Test error handling and invalid inputs
        // Add error handling tests here
        assertTrue(true); // Placeholder assertion
    }
}`;
    
    coverage = 70;
    framework = "JUnit 5";
  } else {
    // Generic tests for other languages (JavaScript/TypeScript)
    mockTests = `// Test file for ${_request.language} code
// Add your test cases here based on the actual code

describe('Code Analysis', () => {
  test('basic functionality', () => {
    // Add your test cases here
    expect(true).toBe(true);
  });
  
  test('edge cases', () => {
    // Add edge case tests here
    expect(true).toBe(true);
  });
  
  test('error handling', () => {
    // Add error handling tests here
    expect(true).toBe(true);
  });
});`;
    
    coverage = 70;
    framework = "Jest";
  }

  return {
    tests: mockTests,
    framework: framework,
    coverage: coverage
  };
}
// Performance analysis
export type PerfRequest = {
  language: string;
  code?: string;
  cmd?: string[];
};
export type PerfResponse = {
  execution_time: number;
  memory_usage: number; // MB
  output: string;
  error?: string;
};
export async function runPerformanceAnalysis(_request: PerfRequest): Promise<PerfResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate API delay

  // Generate realistic performance metrics based on code complexity
  const codeLength = _request.code?.length || 100;
  const complexity = Math.min(codeLength / 100, 10); // Simple complexity metric
  
  // Detect if this is Fibonacci code for more specific suggestions
  const isFibonacci = _request.code?.includes('fibonacci') || _request.code?.includes('Fibonacci');
  const language = _request.language.toLowerCase();

  // Generate realistic execution time (in seconds)
  let executionTime: number;
  if (isFibonacci && language === 'python') {
    // Fibonacci has exponential complexity, so larger inputs take much longer
    executionTime = Math.round((0.001 + Math.pow(complexity, 2) * 0.01 + Math.random() * 0.05) * 1000) / 1000;
  } else {
    executionTime = Math.round((0.05 + complexity * 0.02 + Math.random() * 0.03) * 1000) / 1000;
  }

  // Generate realistic memory usage (in MB)
  const memoryUsageMb = Math.round((0.5 + complexity * 0.1 + Math.random() * 0.2) * 100) / 100;

  // Generate language and code-specific optimization suggestions
  let output = `Performance analysis completed for ${_request.language} code.\n\n`;
  output += `Code complexity: ${complexity.toFixed(1)}\n`;
  output += `Execution time: ${executionTime}s\n`;
  output += `Memory usage: ${formatMemoryMB(memoryUsageMb)}\n\n`;
  
  if (isFibonacci && language === 'python') {
    output += `Optimization suggestions for Fibonacci function:\n`;
    output += `- ⚠️  Current implementation has O(2^n) time complexity\n`;
    output += `- 🚀  Implement memoization to reduce to O(n) time complexity\n`;
    output += `- 💾  Use dynamic programming for better memory efficiency\n`;
    output += `- 🔒  Add input validation for negative numbers\n`;
    output += `- 📊  Consider iterative approach for very large numbers\n`;
  } else if (language === 'python') {
    output += `General Python optimization suggestions:\n`;
    output += `- Consider using more efficient algorithms for large datasets\n`;
    output += `- Memory usage is within acceptable range\n`;
    output += `- Execution time could be improved with caching\n`;
    output += `- Profile the code to identify bottlenecks\n`;
  } else if (language === 'javascript' || language === 'js') {
    output += `JavaScript optimization suggestions:\n`;
    output += `- Consider using Web Workers for CPU-intensive tasks\n`;
    output += `- Implement debouncing for frequent function calls\n`;
    output += `- Use efficient data structures (Map, Set) where appropriate\n`;
    output += `- Profile with Chrome DevTools Performance tab\n`;
  } else if (language === 'java') {
    output += `Java optimization suggestions:\n`;
    output += `- Consider using StringBuilder for string concatenation\n`;
    output += `- Use appropriate collection types (ArrayList vs LinkedList)\n`;
    output += `- Profile with JProfiler or VisualVM\n`;
    output += `- Consider parallel streams for large datasets\n`;
  } else {
    output += `General optimization suggestions:\n`;
    output += `- Profile the code to identify performance bottlenecks\n`;
    output += `- Consider algorithm complexity improvements\n`;
    output += `- Memory usage appears reasonable\n`;
    output += `- Look for opportunities to cache results\n`;
  }

  const mockResponse: PerfResponse = {
    execution_time: executionTime,
    memory_usage: memoryUsageMb,
    output: output,
    error: undefined
  };

  return mockResponse;
}
// Refactor planning
export type RefactorResponse = {
  suggestions: Array<{
    file: string;
    type: string;
    description: string;
    priority: string;
    impact?: string;
    // Enhanced fields for better refactor suggestions
    codeSpans?: Array<{
      line: number;
      column: number;
      length: number;
      code: string;
    }>;
    diff?: {
      before: string;
      after: string;
      hunks: Array<{
        oldStart: number;
        oldLines: number;
        newStart: number;
        newLines: number;
        lines: string[];
      }>;
    };
    estimatedEffort?: string;
    riskLevel?: "low" | "medium" | "high";
    dependencies?: string[];
  }>;
  metrics: {
    complexity: number;
    maintainability: number;
    testability: number;
  };
};
export async function getRefactorPlan(): Promise<RefactorResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

  const mockSuggestions = [
    {
      file: "src/utils/dataProcessor.js",
      type: "Extract Function",
      description: "Break down the large processUserData function into smaller, more focused functions",
      priority: "high",
      impact: "Improves readability and testability",
      codeSpans: [
        { line: 45, column: 0, length: 120, code: "function processUserData(userData) {" },
        { line: 46, column: 2, length: 80, code: "  // Complex validation logic" },
        { line: 47, column: 2, length: 85, code: "  if (userData && userData.profile) {" }
      ],
      diff: {
        before: "function processUserData(userData) {\n  // Complex validation logic\n  if (userData && userData.profile) {\n    // ... 100+ lines of complex logic\n  }\n}",
        after: "function processUserData(userData) {\n  const validatedData = validateUserData(userData);\n  const processedData = transformUserData(validatedData);\n  return processedData;\n}\n\nfunction validateUserData(userData) {\n  // Extracted validation logic\n}\n\nfunction transformUserData(data) {\n  // Extracted transformation logic\n}",
        hunks: [
          {
            oldStart: 45,
            oldLines: 120,
            newStart: 45,
            newLines: 15,
            lines: [
              "@@ -45,120 +45,15 @@",
              " function processUserData(userData) {",
              "-  // Complex validation logic",
              "-  if (userData && userData.profile) {",
              "-    // ... 100+ lines of complex logic",
              "-  }",
              "+  const validatedData = validateUserData(userData);",
              "+  const processedData = transformUserData(validatedData);",
              "+  return processedData;",
              "+ }",
              "+ ",
              "+ function validateUserData(userData) {",
              "+   // Extracted validation logic",
              "+ }",
              "+ ",
              "+ function transformUserData(data) {",
              "+   // Extracted transformation logic",
              "+ }"
            ]
          }
        ]
      },
      estimatedEffort: "2-3 hours",
      riskLevel: "low" as const,
      dependencies: ["userValidation.js", "dataTransformation.js"]
    },
    {
      file: "src/components/UserProfile.tsx",
      type: "Remove Duplication",
      description: "Extract common validation logic into a shared utility function",
      priority: "medium",
      impact: "Reduces code duplication and maintenance overhead",
      codeSpans: [
        { line: 23, column: 0, length: 45, code: "const validateEmail = (email: string) => {" },
        { line: 67, column: 0, length: 45, code: "const validateEmail = (email: string) => {" }
      ],
      diff: {
        before: "// Duplicate validation functions in multiple components",
        after: "// Single validation utility imported from shared module",
        hunks: [
          {
            oldStart: 23,
            oldLines: 45,
            newStart: 23,
            newLines: 3,
            lines: [
              "@@ -23,45 +23,3 @@",
              "- const validateEmail = (email: string) => {",
              "-   // ... validation logic",
              "- };",
              "+ import { validateEmail } from '@/utils/validation';"
            ]
          }
        ]
      },
      estimatedEffort: "1-2 hours",
      riskLevel: "low" as const,
      dependencies: ["@/utils/validation"]
    },
    {
      file: "src/services/apiClient.js",
      type: "Improve Error Handling",
      description: "Add comprehensive error handling and retry logic for API calls",
      priority: "high",
      impact: "Improves application reliability and user experience",
      codeSpans: [
        { line: 15, column: 0, length: 30, code: "try {\n  const response = await fetch(url);" },
        { line: 16, column: 2, length: 25, code: "  return response.json();" }
      ],
      diff: {
        before: "try {\n  const response = await fetch(url);\n  return response.json();\n} catch (error) {\n  console.error('API error:', error);\n}",
        after: "try {\n  const response = await fetch(url);\n  if (!response.ok) {\n    throw new Error(`HTTP ${response.status}: ${response.statusText}`);\n  }\n  return response.json();\n} catch (error) {\n  if (error.name === 'TypeError') {\n    // Network error, retry once\n    return retryWithBackoff(fetch, url, 1000);\n  }\n  throw error;\n}",
        hunks: [
          {
            oldStart: 15,
            oldLines: 8,
            newStart: 15,
            newLines: 15,
            lines: [
              "@@ -15,8 +15,15 @@",
              " try {",
              "   const response = await fetch(url);",
              "+  if (!response.ok) {",
              "+    throw new Error(`HTTP ${response.status}: ${response.statusText}`);",
              "+  }",
              "   return response.json();",
              " } catch (error) {",
              "-  console.error('API error:', error);",
              "+  if (error.name === 'TypeError') {",
              "+    // Network error, retry once",
              "+    return retryWithBackoff(fetch, url, 1000);",
              "+  }",
              "+  throw error;",
              " }"
            ]
          }
        ]
      },
      estimatedEffort: "3-4 hours",
      riskLevel: "medium" as const,
      dependencies: ["retryWithBackoff utility"]
    }
  ];

  const mockResponse: RefactorResponse = {
    suggestions: mockSuggestions,
    metrics: {
      complexity: 7.2,
      maintainability: 6.8,
      testability: 5.9
    }
  };

  return mockResponse;
}
// Code graph visualization
export type GraphNode = {
  id: string;
  label: string;
  type: string;
  complexity: number;
  size: number;
};
export type GraphEdge = {
  source: string;
  target: string;
  type: string;
  weight: number;
};
export type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  hotspots: Array<{
    node: string;
    score: number;
    reason: string;
  }>;
  totalComplexity?: number;
  complexityMetrics?: {
    average: number;
    max: number;
    min: number;
    distribution: Array<{
      range: string;
      count: number;
    }>;
  };
};
export async function getCodeGraph(): Promise<GraphResponse> {
  // Mock response for demo purposes
  await new Promise(resolve => setTimeout(resolve, 1800)); // Simulate API delay

  const mockNodes: GraphNode[] = [
    { id: "main", label: "main.ts", type: "entry", complexity: 8.5, size: 120 },
    { id: "auth", label: "auth.service.ts", type: "service", complexity: 6.2, size: 85 },
    { id: "user", label: "user.controller.ts", type: "controller", complexity: 7.1, size: 95 },
    { id: "database", label: "database.ts", type: "utility", complexity: 4.3, size: 60 },
    { id: "api", label: "api.routes.ts", type: "router", complexity: 5.8, size: 75 },
    { id: "middleware", label: "middleware.ts", type: "middleware", complexity: 3.9, size: 45 },
    { id: "config", label: "config.ts", type: "config", complexity: 2.1, size: 30 },
    { id: "utils", label: "utils.ts", type: "utility", complexity: 4.7, size: 55 }
  ];

  const mockEdges: GraphEdge[] = [
    { source: "main", target: "auth", type: "imports", weight: 0.8 },
    { source: "main", target: "api", type: "imports", weight: 0.9 },
    { source: "auth", target: "user", type: "calls", weight: 0.7 },
    { source: "auth", target: "database", type: "uses", weight: 0.6 },
    { source: "user", target: "database", type: "uses", weight: 0.8 },
    { source: "api", target: "user", type: "routes", weight: 0.9 },
    { source: "api", target: "middleware", type: "uses", weight: 0.5 },
    { source: "middleware", target: "auth", type: "calls", weight: 0.6 },
    { source: "main", target: "config", type: "imports", weight: 0.4 },
    { source: "utils", target: "database", type: "helpers", weight: 0.3 }
  ];

  const mockHotspots = [
    { node: "main", score: 8.5, reason: "High complexity entry point with multiple dependencies" },
    { node: "user", score: 7.1, reason: "Complex controller with multiple responsibilities" },
    { node: "auth", score: 6.2, reason: "Authentication logic with moderate complexity" }
  ];

  const mockResponse: GraphResponse = {
    nodes: mockNodes,
    edges: mockEdges,
    hotspots: mockHotspots,
    totalComplexity: mockNodes.reduce((sum, node) => sum + node.complexity, 0),
    complexityMetrics: {
      average: Math.round((mockNodes.reduce((sum, node) => sum + node.complexity, 0) / mockNodes.length) * 10) / 10,
      max: Math.max(...mockNodes.map(n => n.complexity)),
      min: Math.min(...mockNodes.map(n => n.complexity)),
      distribution: [
        { range: "1-3", count: mockNodes.filter(n => n.complexity <= 3).length },
        { range: "4-6", count: mockNodes.filter(n => n.complexity > 3 && n.complexity <= 6).length },
        { range: "7-9", count: mockNodes.filter(n => n.complexity > 6 && n.complexity <= 9).length },
        { range: "10+", count: mockNodes.filter(n => n.complexity > 9).length }
      ]
    }
  };

  return mockResponse;
}
// Chat API with Gemini integration
export type ChatRequest = {
  message: string;
  context?: string;
};

export type ChatResponse = {
  response: string;
  timestamp: string;
};

export async function sendChatMessage(_request: ChatRequest): Promise<ChatResponse> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // Check if API key is configured
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'test_key_for_development') {
    // Provide intelligent demo responses for common programming questions
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

    const demoResponses = {
      python: "Python is a versatile programming language! For optimization, consider using list comprehensions, built-in functions like `map()` and `filter()`, and libraries like NumPy for numerical operations. What specific Python topic would you like help with?",
      javascript: "JavaScript is great for web development! For better performance, use `const` and `let` instead of `var`, leverage async/await for asynchronous operations, and consider using modern ES6+ features. What JavaScript concept can I help you with?",
      java: "Java is excellent for enterprise applications! Focus on object-oriented principles, use proper exception handling, and leverage the Collections framework. Consider using streams for data processing. What Java topic interests you?",
      react: "React is a powerful UI library! Use functional components with hooks, implement proper state management, and optimize with React.memo() and useMemo(). What React concept would you like to explore?",
      default: "I'm Codie, your AI programming assistant! I can help with code optimization, debugging, best practices, and explaining programming concepts. Ask me about Python, JavaScript, Java, React, or any programming topic!"
    };

    const message = _request.message.toLowerCase();
    let response = demoResponses.default;

    if (message.includes('python')) response = demoResponses.python;
    else if (message.includes('javascript') || message.includes('js')) response = demoResponses.javascript;
    else if (message.includes('java')) response = demoResponses.java;
    else if (message.includes('react')) response = demoResponses.react;
    else if (message.includes('help') || message.includes('hello') || message.includes('hi')) {
      response = "Hello! I'm Codie, your AI programming assistant. I can help you with code optimization, debugging, best practices, and explaining programming concepts. What would you like to work on today?";
    }

    return {
      response: `${response}\n\n*Note: This is a demo response. To get real AI responses, please configure your Gemini API key in the environment variables (VITE_GEMINI_API_KEY).*`,
      timestamp: new Date().toISOString()
    };
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Codie, an AI assistant specialized in code analysis and programming help.

User message: ${_request.message}
${_request.context ? `\nCode context: ${_request.context}` : ''}

Please provide helpful, accurate programming advice. Be concise but thorough.`
          }]
        }]
      })
    });

    if (!response.ok) {
      // Handle specific API errors
      if (response.status === 400) {
        throw new Error("Invalid API key or request format. Please check your Gemini API key configuration.");
      } else if (response.status === 403) {
        throw new Error("API key doesn't have permission to access Gemini API. Please check your API key settings.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      } else {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response from Gemini API");
    }

    return {
      response: data.candidates[0].content.parts[0].text,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini API error:", error);

    // Improved fallback response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      response: `I'm having trouble connecting to the AI service right now. ${error instanceof Error ? error.message : 'Please try again later.'}\n\nIn the meantime, I can suggest checking your code for common issues like syntax errors, proper variable naming, and following best practices for your programming language.`,
      timestamp: new Date().toISOString()
    };
  }
}

// Export functions
export async function exportData(format: "csv" | "json" | "md" | "pdf") {
  const response = await api.get(`/api/v1/export/${format}`, {
    responseType: "blob",
  });
  return response.data;
}
// Health check
export type HealthResponse = {
  ok: boolean;
  build: string;
  ts: string;
};
export async function getHealth() {
  const { data } = await api.get<HealthResponse>("/api/v1/health");
  return data;
}

