import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CodeEditor } from '../../components/CodeEditor';
import * as api from '../../services/api';

// Mock the API service
vi.mock('../../services/api');

const mockApi = api as jest.Mocked<typeof api>;

// Mock file
const createMockFile = (name: string, content: string, type: string = 'text/plain') => {
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', { value: content.length });
  return file;
};

// Wrapper component for testing with router context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('CodeEditor Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  describe('File Upload Integration', () => {
    it('handles successful file upload and analysis', async () => {
      const mockAnalysisResult = {
        score: 85,
        suggestions: [
          { id: 1, title: 'Improve naming', description: 'Use more descriptive variable names' },
          { id: 2, title: 'Add comments', description: 'Add JSDoc comments for functions' }
        ],
        complexity: { cyclomatic: 5, cognitive: 8 },
        security: { vulnerabilities: [], score: 90 },
        style: { issues: [], score: 88 }
      };

      mockApi.analyzeCode.mockResolvedValue(mockAnalysisResult);

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() { return true; }');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Analyzing code...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Score: 85')).toBeInTheDocument();
        expect(screen.getByText('Improve naming')).toBeInTheDocument();
        expect(screen.getByText('Add comments')).toBeInTheDocument();
      });

      expect(mockApi.analyzeCode).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.js',
          content: 'function test() { return true; }'
        })
      );
    });

    it('handles file upload errors gracefully', async () => {
      const mockError = new Error('Analysis failed');
      mockApi.analyzeCode.mockRejectedValue(mockError);

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() { return true; }');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Error analyzing code')).toBeInTheDocument();
        expect(screen.getByText('Analysis failed')).toBeInTheDocument();
      });
    });

    it('validates file types and sizes', async () => {
      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      
      // Test unsupported file type
      const unsupportedFile = createMockFile('test.txt', 'content', 'text/plain');
      fireEvent.change(fileInput, { target: { files: [unsupportedFile] } });

      await waitFor(() => {
        expect(screen.getByText('Unsupported file type')).toBeInTheDocument();
      });

      // Test file too large
      const largeFile = createMockFile('large.js', 'x'.repeat(1024 * 1024 + 1));
      fireEvent.change(fileInput, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(screen.getByText('File too large')).toBeInTheDocument();
      });
    });

    it('shows upload progress', async () => {
      mockApi.analyzeCode.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ score: 85, suggestions: [] }), 100))
      );

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() { return true; }');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
      });
    });
  });

  describe('Code Analysis Integration', () => {
    it('displays analysis results correctly', async () => {
      const mockResult = {
        score: 92,
        suggestions: [
          { id: 1, title: 'Optimize loop', description: 'Consider using forEach instead of for loop' }
        ],
        complexity: { cyclomatic: 3, cognitive: 5 },
        security: { vulnerabilities: [], score: 95 },
        style: { issues: [], score: 90 }
      };

      mockApi.analyzeCode.mockResolvedValue(mockResult);

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'for(let i=0;i<10;i++){}');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Score: 92')).toBeInTheDocument();
        expect(screen.getByText('Optimize loop')).toBeInTheDocument();
        expect(screen.getByText('Cyclomatic Complexity: 3')).toBeInTheDocument();
        expect(screen.getByText('Security Score: 95')).toBeInTheDocument();
      });
    });

    it('handles different analysis types', async () => {
      const mockResult = {
        score: 78,
        suggestions: [],
        complexity: { cyclomatic: 12, cognitive: 15 },
        security: { 
          vulnerabilities: [
            { severity: 'high', description: 'SQL injection risk' }
          ], 
          score: 60 
        },
        style: { 
          issues: [
            { type: 'warning', description: 'Inconsistent indentation' }
          ], 
          score: 85 
        }
      };

      mockApi.analyzeCode.mockResolvedValue(mockResult);

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function complex() { /* complex code */ }');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('High Risk: SQL injection risk')).toBeInTheDocument();
        expect(screen.getByText('Warning: Inconsistent indentation')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('shows network error messages', async () => {
      mockApi.analyzeCode.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() {}');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        expect(screen.getByText('Please check your connection and try again')).toBeInTheDocument();
      });
    });

    it('shows server error messages', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      mockApi.analyzeCode.mockRejectedValue(serverError);

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value=""
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() {}');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
        expect(screen.getByText('Please try again later')).toBeInTheDocument();
      });
    });

    it('provides retry functionality', async () => {
      mockApi.analyzeCode.mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ score: 85, suggestions: [] });

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value="function test() {}"
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() {}');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Temporary error')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Score: 85')).toBeInTheDocument();
      });
    });
  });

  describe('State Management Integration', () => {
    it('persists analysis history in localStorage', async () => {
      const mockResult = { score: 85, suggestions: [] };
      mockApi.analyzeCode.mockResolvedValue(mockResult);

      const localStorageMock = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value="function test() {}"
            onChange={() => {}}
          />
        </TestWrapper>
      );

      const fileInput = screen.getByTestId('file-input');
      const mockFile = createMockFile('test.js', 'function test() {}');

      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('Score: 85')).toBeInTheDocument();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'analysis_history',
        expect.stringContaining('test.js')
      );
    });

    it('loads previous analysis from localStorage', () => {
      const mockHistory = JSON.stringify([
        {
          id: '1',
          filename: 'previous.js',
          score: 80,
          timestamp: Date.now(),
          content: 'function previous() {}'
        }
      ]);

      const localStorageMock = {
        getItem: vi.fn().mockReturnValue(mockHistory),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      render(
        <TestWrapper>
          <CodeEditor 
            language="javascript"
            value="function test() {}"
            onChange={() => {}}
          />
        </TestWrapper>
      );

      expect(screen.getByText('previous.js')).toBeInTheDocument();
      expect(screen.getByText('Score: 80')).toBeInTheDocument();
    });
  });
});
