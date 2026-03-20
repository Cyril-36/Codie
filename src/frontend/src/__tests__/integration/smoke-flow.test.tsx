import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import GraphPage from '../../pages/GraphPage';
import History from '../../pages/History';
import RefactorPage from '../../pages/RefactorPage';
import SecurityPage from '../../pages/SecurityPage';

// Mock the modular API services
vi.mock('../../services/securityApi', () => ({
  scanSecurity: vi.fn(),
}));
vi.mock('../../services/graphApi', () => ({
  getCodeGraph: vi.fn(),
}));
vi.mock('../../services/refactorApi', () => ({
  getRefactorPlan: vi.fn(),
}));
vi.mock('../../services/historyApi', () => ({
  fetchHistory: vi.fn(),
  deleteHistoryItem: vi.fn(),
  clearHistory: vi.fn(),
  getHistoryStats: vi.fn(),
  getHistoryItem: vi.fn(),
}));

// Mock the API responses
const mockSecurityResponse = {
  vulnerabilities: [
    {
      package: "flask",
      severity: "high",
      description: "Flask 1.1.2 has a known vulnerability CVE-2021-23385",
      cve: "CVE-2021-23385",
      version: "1.1.2",
      fixed_in: "2.0.0",
      patch: "pip install --upgrade flask",
      references: ["https://nvd.nist.gov/vuln/detail/CVE-2021-23385"],
      cve_source: "NVD",
      version_ranges: [{ introduced: "0.0.0", fixed: "2.0.0", type: "semver" }],
      affected_ecosystems: ["PyPI"],
      cwe_ids: ["CWE-94"],
      attack_vector: "Network",
      impact: { confidentiality: "High", integrity: "High", availability: "High" },
      published_date: "2021-01-19T00:00:00Z",
      last_modified_date: "2021-01-19T00:00:00Z"
    }
  ],
  summary: { total: 1, high: 1, medium: 0, low: 0 },
  scanned_packages: 1,
  scan_timestamp: new Date().toISOString(),
  language: "python"
};

const mockGraphResponse = {
  nodes: [
    { id: "main", label: "main.ts", type: "entry", complexity: 8.5, size: 120 },
    { id: "auth", label: "auth.service.ts", type: "service", complexity: 6.2, size: 85 }
  ],
  edges: [
    { source: "main", target: "auth", type: "imports", weight: 0.8 }
  ],
  hotspots: [
    { node: "main", score: 8.5, reason: "High complexity entry point" }
  ],
  totalComplexity: 14.7,
  complexityMetrics: {
    average: 7.35,
    max: 8.5,
    min: 6.2,
    distribution: [
      { range: "1-3", count: 0 },
      { range: "4-6", count: 0 },
      { range: "7-9", count: 2 },
      { range: "10+", count: 0 }
    ]
  }
};

const mockRefactorResponse = {
  suggestions: [
    {
      file: "src/utils/dataProcessor.js",
      type: "Extract Function",
      description: "Break down the large processUserData function",
      priority: "high",
      impact: "Improves readability and testability",
      estimatedEffort: "2-3 hours",
      riskLevel: "low" as const,
      dependencies: ["userValidation.js"]
    }
  ],
  metrics: { complexity: 7.2, maintainability: 6.8, testability: 5.9 }
};

const mockHistoryResponse = {
  items: [
    { id: 1, language: "Python", complexity: 8.5, created_at: "2024-01-15T10:30:00Z" },
    { id: 2, language: "JavaScript", complexity: 6.2, created_at: "2024-01-15T09:15:00Z" }
  ],
  total: 2,
  page: 1,
  size: 10
};

// Helper function to render components with router + react-query
const makeQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderWithRouter = (component: React.ReactElement) => {
  const qc = makeQueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Smoke Test: Complete User Flow', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mock implementations
    const securityApi = await import('../../services/securityApi');
    const graphApi = await import('../../services/graphApi');
    const refactorApi = await import('../../services/refactorApi');
    const historyApi = await import('../../services/historyApi');

    (securityApi.scanSecurity as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockSecurityResponse);
    (graphApi.getCodeGraph as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockGraphResponse);
    (refactorApi.getRefactorPlan as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockRefactorResponse);
    (historyApi.fetchHistory as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistoryResponse);
  });

  describe('1. Security Scanner Flow', () => {
    it('should complete a security scan successfully', async () => {
      renderWithRouter(<SecurityPage />);

      await waitFor(() => {
        expect(screen.getByText('Security Scanner')).toBeInTheDocument();
      });

      const requirementsTextarea = screen.getByPlaceholderText(/requests==2\.25\.1/);
      fireEvent.change(requirementsTextarea, {
        target: { value: 'flask==1.1.2\nrequests==2.25.1' }
      });

      const languageSelect = screen.getByLabelText(/Language/);
      fireEvent.change(languageSelect, { target: { value: 'python' } });

      const scanButton = screen.getByText('Scan for Vulnerabilities');
      fireEvent.click(scanButton);

      await waitFor(() => {
        expect(screen.getByText('Security Scan Results')).toBeInTheDocument();
      });

      expect(screen.getByText('CVE-2021-23385')).toBeInTheDocument();
      expect(screen.getByText('High Severity')).toBeInTheDocument();
      expect(screen.getByText('flask')).toBeInTheDocument();
    });

    it('should handle security scan errors gracefully', async () => {
      const securityApi = await import('../../services/securityApi');
      (securityApi.scanSecurity as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      renderWithRouter(<SecurityPage />);

      const requirementsTextarea = screen.getByPlaceholderText(/requests==2\.25\.1/);
      fireEvent.change(requirementsTextarea, {
        target: { value: 'flask==1.1.2' }
      });

      const scanButton = screen.getByText('Scan for Vulnerabilities');
      fireEvent.click(scanButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('2. Code Graph Flow', () => {
    it('should generate and display code graph successfully', async () => {
      renderWithRouter(<GraphPage />);

      await waitFor(() => {
        expect(screen.getByText('Code Graph')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Graph Overview')).toBeInTheDocument();
      });

      expect(screen.getByText('2', { selector: '.text-2xl.font-bold.text-primary' })).toBeInTheDocument();
      expect(screen.getByText('1', { selector: '.text-2xl.font-bold.text-good' })).toBeInTheDocument();
      expect(screen.getByText('1', { selector: '.text-2xl.font-bold.text-destructive' })).toBeInTheDocument();
      expect(screen.getByText('14.7')).toBeInTheDocument();

      expect(screen.getByText('main.ts')).toBeInTheDocument();
      expect(screen.getByText('High complexity entry point')).toBeInTheDocument();
    });

    it('should display complexity metrics correctly', async () => {
      renderWithRouter(<GraphPage />);

      await waitFor(() => {
        expect(screen.getByText('Complexity Hotspots')).toBeInTheDocument();
      });

      expect(screen.getByText('Raw complexity: 8.5')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Very High')).toBeInTheDocument();
    });
  });

  describe('3. Refactor Planning Flow', () => {
    it('should generate and display refactor suggestions successfully', async () => {
      renderWithRouter(<RefactorPage />);

      await waitFor(() => {
        expect(screen.getByText('Refactor Plan')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Code Quality Metrics')).toBeInTheDocument();
      });

      expect(screen.getByText('7.2')).toBeInTheDocument();
      expect(screen.getByText('6.8')).toBeInTheDocument();
      expect(screen.getByText('5.9')).toBeInTheDocument();

      expect(screen.getByText('Extract Function')).toBeInTheDocument();
      expect(screen.getByText('src/utils/dataProcessor.js')).toBeInTheDocument();
      expect(screen.getByText('Risk: LOW')).toBeInTheDocument();
      expect(screen.getByText('2-3 hours')).toBeInTheDocument();
    });

    it('should handle refactor plan errors gracefully', async () => {
      const refactorApi = await import('../../services/refactorApi');
      (refactorApi.getRefactorPlan as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Analysis failed'));

      renderWithRouter(<RefactorPage />);

      await waitFor(() => {
        expect(screen.getByText(/Analysis failed/)).toBeInTheDocument();
      });
    });
  });

  describe('4. History Flow', () => {
    it('should display analysis history successfully', async () => {
      renderWithRouter(<History />);

      await waitFor(() => {
        expect(screen.getByText('Analysis History')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('History Summary')).toBeInTheDocument();
      });

      expect(screen.getByText('2', { selector: '.text-2xl.font-bold.text-primary' })).toBeInTheDocument();
      expect(screen.getByText('1', { selector: '.text-2xl.font-bold.text-good' })).toBeInTheDocument();

      expect(screen.getByText('Analysis #1')).toBeInTheDocument();
      expect(screen.getByText('Analysis #2')).toBeInTheDocument();
      // Language appears in both filter dropdown and list items — use getAllByText
      expect(screen.getAllByText('Python').length).toBeGreaterThan(0);
      expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
    });

    it('should handle history loading errors gracefully', async () => {
      const historyApi = await import('../../services/historyApi');
      (historyApi.fetchHistory as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to load history'));

      renderWithRouter(<History />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load history/)).toBeInTheDocument();
      });
    });
  });

  describe('5. End-to-End Integration', () => {
    it('should maintain consistent state across all flows', async () => {
      const components = [
        <SecurityPage key="security" />,
        <GraphPage key="graph" />,
        <RefactorPage key="refactor" />,
        <History key="history" />
      ];

      components.forEach((component, index) => {
        const { unmount } = renderWithRouter(component);

        if (index === 0) {
          expect(screen.getByText('Security Scanner')).toBeInTheDocument();
        } else if (index === 1) {
          expect(screen.getByText('Code Graph')).toBeInTheDocument();
        } else if (index === 2) {
          expect(screen.getByText('Refactor Plan')).toBeInTheDocument();
        } else if (index === 3) {
          expect(screen.getByText('Analysis History')).toBeInTheDocument();
        }

        unmount();
      });
    });

    it('should handle rapid navigation between flows', async () => {
      const { unmount: unmountSecurity } = renderWithRouter(<SecurityPage />);
      await waitFor(() => expect(screen.getByText('Security Scanner')).toBeInTheDocument());
      unmountSecurity();

      const { unmount: unmountGraph } = renderWithRouter(<GraphPage />);
      await waitFor(() => expect(screen.getByText('Code Graph')).toBeInTheDocument());
      unmountGraph();

      const { unmount: unmountRefactor } = renderWithRouter(<RefactorPage />);
      await waitFor(() => expect(screen.getByText('Refactor Plan')).toBeInTheDocument());
      unmountRefactor();

      const { unmount: unmountHistory } = renderWithRouter(<History />);
      await waitFor(() => expect(screen.getByText('Analysis History')).toBeInTheDocument());
      unmountHistory();
    });
  });

  describe('6. Performance and Reliability', () => {
    it('should complete all flows within reasonable time', async () => {
      const startTime = performance.now();

      const { unmount: unmountSecurity } = renderWithRouter(<SecurityPage />);
      await waitFor(() => expect(screen.getByText('Security Scanner')).toBeInTheDocument());
      unmountSecurity();

      const { unmount: unmountGraph } = renderWithRouter(<GraphPage />);
      await waitFor(() => expect(screen.getByText('Code Graph')).toBeInTheDocument());
      unmountGraph();

      const { unmount: unmountRefactor } = renderWithRouter(<RefactorPage />);
      await waitFor(() => expect(screen.getByText('Refactor Plan')).toBeInTheDocument());
      unmountRefactor();

      const { unmount: unmountHistory } = renderWithRouter(<History />);
      await waitFor(() => expect(screen.getByText('Analysis History')).toBeInTheDocument());
      unmountHistory();

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(5000);
    });

    it('should handle concurrent API calls without conflicts', async () => {
      const { unmount: unmountSecurity } = renderWithRouter(<SecurityPage />);
      const { unmount: unmountGraph } = renderWithRouter(<GraphPage />);

      await waitFor(() => expect(screen.getByText('Security Scanner')).toBeInTheDocument());
      await waitFor(() => expect(screen.getByText('Code Graph')).toBeInTheDocument());

      unmountSecurity();
      unmountGraph();
    });
  });
});
