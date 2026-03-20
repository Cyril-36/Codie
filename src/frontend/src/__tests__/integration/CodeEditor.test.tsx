import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CodeEditor } from '../../components/CodeEditor';
import * as analysisApi from '../../services/analysisApi';

// Mock the API service
vi.mock('../../services/analysisApi');

const mockApi = analysisApi as jest.Mocked<typeof analysisApi>;

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
        ok: true,
        score: 85,
        suggestions: [
          'Improve naming: Use more descriptive variable names',
          'Add comments: Add JSDoc comments for functions'
        ],
        complexity: 5,
      };

      mockApi.analyzeSnippet.mockResolvedValue(mockAnalysisResult);

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
      });

      expect(mockApi.analyzeSnippet).toHaveBeenCalled();
    });

    it('handles file upload errors gracefully', async () => {
      const mockError = new Error('Analysis failed');
      mockApi.analyzeSnippet.mockRejectedValue(mockError);

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
      mockApi.analyzeSnippet.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ ok: true, suggestions: [], complexity: 3 } as any), 100))
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
        ok: true,
        score: 92,
        suggestions: [
          'Optimize loop: Consider using forEach instead of for loop'
        ],
        complexity: 3,
      };

      mockApi.analyzeSnippet.mockResolvedValue(mockResult);

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
      });
    });

    it('handles different analysis types', async () => {
      const mockResult = {
        ok: true,
        score: 78,
        suggestions: ['SQL injection risk detected'],
        complexity: 12,
      };

      mockApi.analyzeSnippet.mockResolvedValue(mockResult);

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
        expect(mockApi.analyzeSnippet).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('shows network error messages', async () => {
      mockApi.analyzeSnippet.mockRejectedValue(new Error('Network error'));

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
      });
    });

    it('shows server error messages', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      mockApi.analyzeSnippet.mockRejectedValue(serverError);

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
      });
    });

    it('provides retry functionality', async () => {
      mockApi.analyzeSnippet.mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce({ ok: true, score: 85, suggestions: [], complexity: 3 } as any);

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
      const mockResult = { ok: true, score: 85, suggestions: [], complexity: 3 };
      mockApi.analyzeSnippet.mockResolvedValue(mockResult);

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
