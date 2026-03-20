import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { PageTransition } from '../components/Transitions/PageTransition';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { fetchHistory, deleteHistoryItem, clearHistory, type HistoryItem } from '../services/historyApi';

export default function History() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [language, setLanguage] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['history', page, size, language, analysisType],
    queryFn: () => fetchHistory(page, size, language || undefined, analysisType || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
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

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-foreground"
          >
            <option value="">All Languages</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
          </select>
          <select
            value={analysisType}
            onChange={(e) => { setAnalysisType(e.target.value); setPage(1); }}
            className="border rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-foreground"
          >
            <option value="">All Types</option>
            <option value="code_review">Code Review</option>
            <option value="security">Security</option>
            <option value="style">Style</option>
          </select>
          <Button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || !data?.items.length}
            variant="outline"
            size="sm"
          >
            {clearMutation.isPending ? "Clearing..." : "Clear All"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/10 fade-in">
            <div className="flex items-center gap-2 text-destructive">
              <span className="text-lg">&#10060;</span>
              <span>Error: {error instanceof Error ? error.message : "Failed to fetch history"}</span>
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
              {data.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No analyses yet</p>
                  <p className="text-sm">Run your first code analysis to see it here</p>
                </div>
              ) : (
              <div className="space-y-3 list-stagger scrollable max-h-96">
                {data.items.map((item: HistoryItem, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors card-elevate"
                    style={{ '--i': index } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-lg">&#128196;</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">
                            Analysis #{item.id}
                          </span>
                          <Badge className={getLanguageColor(item.language)}>
                            {item.language}
                          </Badge>
                          {item.analysis_type && (
                            <Badge className="bg-muted text-muted-foreground text-xs">
                              {item.analysis_type}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Complexity
                        </div>
                        <div className={`text-lg font-bold ${getComplexityColor(item.complexity)}`}>
                          {item.complexity.toFixed(1)}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete"
                      >
                        &#128465;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !data && (
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
