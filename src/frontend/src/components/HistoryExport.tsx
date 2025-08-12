import React, { useState } from 'react';

import { useScreenReaderAnnouncement } from '../hooks/useScreenReader';

import Button from './ui/Button';


interface HistoryExportProps {
  // Add props as needed
}
const HistoryExport: React.FC<HistoryExportProps> = () => {
  const [exporting, setExporting] = useState(false);
  const { announce } = useScreenReaderAnnouncement();
  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    announce(`Exporting history as ${format.toUpperCase()}...`);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Create mock data for download
      const mockData = format === 'csv'
        ? 'ID,Language,Complexity,Created\n1,Python,75,2024-01-01\n2,JavaScript,82,2024-01-02'
        : JSON.stringify([
            { id: 1, language: 'Python', complexity: 75, created_at: '2024-01-01' },
            { id: 2, language: 'JavaScript', complexity: 82, created_at: '2024-01-02' }
          ], null, 2);
      const blob = new Blob([mockData], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-history.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      announce(`History exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      announce(`Export failed: ${error}`, "assertive");
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="flex items-center gap-3 fade-in">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        loading={exporting}
        disabled={exporting}
        className="btn-anim hover-lift"

        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      >
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('json')}
        loading={exporting}
        disabled={exporting}
        className="btn-anim hover-lift"

        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        }
      >
        Export JSON
      </Button>
    </div>
  );
};
export default HistoryExport;
