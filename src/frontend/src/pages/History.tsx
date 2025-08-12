import { motion } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';

import { PageTransition } from '../components/Transitions/PageTransition';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { fetchHistory } from '../services/api';

export default function History() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | null>(null); // Changed type to any as HistoryResponse is removed
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const handleFetchHistory = useCallback(async (pageNum = page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchHistory(pageNum, size); // Changed fetchHistory to getHistory
      setData(response);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch history";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    handleFetchHistory(1);
  }, [handleFetchHistory]);

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'python': return 'bg-primary/10 text-primary border-primary/20';
      case 'javascript': return 'bg-warning/10 text-warning border-warning/20';
      case 'typescript': return 'bg-primary/10 text-primary border-primary/20';
      case 'java': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'go': return 'bg-highlight/10 text-highlight border-highlight/20';
      case 'rust': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 8) return 'text-destructive';
    if (complexity >= 6) return 'text-warning';
    return 'text-good';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalPages = data ? Math.ceil(data.total / size) : 0;

  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        {/* Header Section */}
        <div className="text-center fade-in">
          <nav aria-label="History" className="mb-2">
            <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
          </nav>
          <p className="text-muted-foreground">
            View your previous code analysis results and track complexity trends
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => handleFetchHistory(1)}
            disabled={loading}
            loading={loading}
            className="btn-anim"
          >
            {loading ? "Loading History..." : "📊 Refresh History"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/10 fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-lg">❌</span>
              <span>Error: {error}</span>
            </div>
          </Card>
        )}

        {/* Results Display */}
        {data && (
          <div className="space-y-6 fade-in">
            {/* Summary */}
            <Card className="card-elevate fade-in">
              <h3 className="sticky-subheader text-lg font-semibold text-foreground mb-4">
                History Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 list-stagger">
                <div className="text-center" style={{ '--i': 0 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-primary">
                    {data.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Analyses</div>
                </div>
                <div className="text-center" style={{ '--i': 1 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-good">
                    {page}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Page</div>
                </div>
                <div className="text-center" style={{ '--i': 2 } as React.CSSProperties}>
                  <div className="text-2xl font-bold text-highlight">
                    {totalPages}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Pages</div>
                </div>
              </div>
            </Card>

            {/* History Items */}
            <Card className="card-elevate fade-in">
              <h3 className="sticky-subheader text-lg font-semibold text-foreground mb-4">
                Analysis History ({data.items.length} of {data.total})
              </h3>
              <div className="space-y-3 list-stagger scrollable max-h-96">
                {data.items.map((item: any, index: number) => ( // Changed type to any
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors card-elevate"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg">📄</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            Analysis #{item.id}
                          </span>
                          <Badge className={getLanguageColor(item.language)}>
                            {item.language}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        Complexity
                      </div>
                      <div className={`text-lg font-bold ${getComplexityColor(item.complexity)}`}>
                        {item.complexity.toFixed(1)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && !data && (
          <Card className="card-elevate fade-in">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">
                Loading your analysis history...
              </p>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
