import {
  Robot,
  Lightning,
  TrendUp,
  GitPullRequest,
  Package,
  Activity,
  GitBranch,
  ChartLine,
  Warning,
  TestTube,
  Wrench,
  Shield,
  Sliders,
  ArrowSquareOut,
  CheckCircle
} from "phosphor-react";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useToasts } from "../components/ui/ToastProvider";
import { getHistoryStats, fetchHistory } from "../services/historyApi";

interface FeatureCard {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  status: string;
  metrics: string[];
  color: string;
  href: string;
}

export default function EnhancedHome() {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { show: _show } = useToasts();

  // Fetch real stats from backend
  const { data: stats } = useQuery({
    queryKey: ['history-stats'],
    queryFn: getHistoryStats,
  });

  const { data: recentHistory } = useQuery({
    queryKey: ['history', 1, 5],
    queryFn: () => fetchHistory(1, 5),
  });

  // Handle AI Assistant button click
  const handleAIAssistant = () => {
    navigate('/chat');
  };

  // Handle Quick Analysis button click
  const handleQuickAnalysis = () => {
    navigate('/analyze');
  };

  const featureCards = useMemo<FeatureCard[]>(() => [
    {
      id: 'dependency-graph',
      icon: GitBranch,
      title: 'Dependency Graph',
      description: 'Visualize package dependencies and impact analysis',
      status: 'Live',
      metrics: ['Visualize package links', 'Track coupling issues'],
      color: 'from-blue-500 to-cyan-500',
      href: '/graph'
    },
    {
      id: 'performance',
      icon: ChartLine,
      title: 'Performance Charts',
      description: 'Monitor code performance and velocity metrics',
      status: 'Active',
      metrics: ['Track code velocity', 'Monitor line changes'],
      color: 'from-green-500 to-emerald-500',
      href: '/performance'
    },
    {
      id: 'alerts',
      icon: Warning,
      title: 'Alerts & Issues',
      description: 'Track security alerts and code quality issues',
      status: 'Warning',
      metrics: ['Track security issues', 'Monitor code quality'],
      color: 'from-orange-500 to-red-500',
      href: '/security'
    },
    {
      id: 'test-gen',
      icon: TestTube,
      title: 'Test Generator',
      description: 'AI-powered test generation and coverage analysis',
      status: 'Ready',
      metrics: ['AI-generated tests', 'Coverage analysis'],
      color: 'from-purple-500 to-pink-500',
      href: '/test-gen'
    },
    {
      id: 'refactor',
      icon: Wrench,
      title: 'Refactor Planner',
      description: 'Intelligent refactoring suggestions and planning',
      status: 'Queued',
      metrics: ['Find refactor targets', 'Prioritized suggestions'],
      color: 'from-indigo-500 to-blue-500',
      href: '/refactor'
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security Panel',
      description: 'Vulnerability scanning and security recommendations',
      status: 'Secure',
      metrics: ['CVE scanning', 'Dependency security'],
      color: 'from-emerald-500 to-teal-500',
      href: '/security'
    },
    {
      id: 'noise-filter',
      icon: Sliders,
      title: 'Noise Filter / Export',
      description: 'Smart filtering and report generation',
      status: 'Configured',
      metrics: ['Smart filtering', 'Export reports'],
      color: 'from-slate-500 to-gray-500',
      href: '/history'
    },
    {
      id: 'ai-chat',
      icon: Robot,
      title: 'AI Chat',
      description: 'Intelligent code analysis and recommendations',
      status: 'Online',
      metrics: ['AI code assistant', 'Instant help'],
      color: 'from-violet-500 to-purple-500',
      href: '/chat'
    }
  ], []);

  // Animate progress bars based on real stats
  useEffect(() => {
    const total = stats?.total_analyses ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round(total * 2)) : 0;
    const timer = setTimeout(() => {
      setProgressValues({ 'test-gen': pct, 'performance': pct, 'security': pct });
    }, 500);
    return () => clearTimeout(timer);
  }, [stats]);

  const handleCardClick = (card: FeatureCard) => {
    setActiveCard(card.id);
    navigate(card.href);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'live':
      case 'active':
      case 'ready':
      case 'secure':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
      case 'queued':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'configured':
        return 'bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/30';
      case 'online':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="page-enter p-6 space-y-8">
      {/* Header Section */}
      <section className="space-y-4 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--foreground)]">
              Welcome back, Developer! 👋
            </h1>
            <p className="text-[color:var(--muted-foreground)] mt-2">
              Here's what's happening with your codebase today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="btn btn-outline btn-sm btn-anim px-5 py-2.5 min-h-[44px] flex items-center justify-center"
              onClick={handleAIAssistant}
              aria-label="Open AI Chat Assistant"
              role="button"
              tabIndex={0}
            >
              <Robot className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">AI Assistant</span>
            </button>
            <button
              className="btn btn-primary btn-sm btn-anim px-5 py-2.5 min-h-[44px] flex items-center justify-center"
              onClick={handleQuickAnalysis}
              aria-label="Perform Quick Code Analysis"
              role="button"
              tabIndex={0}
            >
              <Lightning className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="font-medium">Quick Analysis</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 card-elevate fade-in kpi">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">Analyses</p>
              <p className="text-xl font-bold text-[color:var(--foreground)]">{stats?.total_analyses ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-elevate fade-in kpi">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">Languages</p>
              <p className="text-xl font-bold text-[color:var(--foreground)]">{stats ? Object.keys(stats.languages).length : 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-elevate fade-in kpi">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">Avg Complexity</p>
              <p className="text-xl font-bold text-[color:var(--foreground)]">{stats?.average_complexity?.toFixed(1) ?? '—'}</p>
            </div>
          </div>
        </div>

        <div className="card p-4 card-elevate fade-in kpi">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-[color:var(--muted-foreground)]">Types</p>
              <p className="text-xl font-bold text-[color:var(--foreground)]">{stats ? Object.keys(stats.analysis_types).length : 0}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {featureCards.map((card, index) => {
          const Icon = card.icon;
          const isActive = activeCard === card.id;
          const progressValue = progressValues[card.id] || 0;

          return (
            <div
              key={card.id}
              className={`card card-elevate p-6 tile group block cursor-pointer transition-all duration-300 ${isActive ? 'scale-105 ring-2 ring-[color:var(--primary)]' : ''
                }`}
              style={{ '--i': index } as React.CSSProperties}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card)}
              tabIndex={0}
              role="button"
              aria-label={`Open ${card.title}`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[color:var(--foreground)]">{card.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(card.status)}`}>
                      {card.status}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="icon-button min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg btn-anim focus-ring"
                  aria-label={`Open ${card.title}`}
                  onClick={(e) => { e.stopPropagation(); navigate(card.href); }}
                >
                  <ArrowSquareOut className={`w-4 h-4 opacity-70 transition-all duration-200 ${isActive ? 'translate-x-1 translate-y-[-1px]' : 'group-hover:translate-x-1'
                    }`} />
                </button>
              </div>

              {/* Card Content */}
              <p className="text-sm text-[color:var(--muted-foreground)] mb-4 leading-relaxed">
                {card.description}
              </p>

              {/* Preview Area */}
              <div className="h-28 rounded-lg shimmer mb-4 relative overflow-hidden">
                {card.id === 'test-gen' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-24 h-2 bg-[color:var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{progressValue}%</p>
                    </div>
                  </div>
                )}

                {card.id === 'performance' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2">
                        <Lightning className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-24 h-2 bg-[color:var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{progressValue}%</p>
                    </div>
                  </div>
                )}

                {card.id === 'security' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-2">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-24 h-2 bg-[color:var(--muted)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progressValue}%` }}
                        />
                      </div>
                      <p className="text-xs text-[color:var(--muted-foreground)] mt-1">{progressValue}%</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                {card.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[color:var(--muted-foreground)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--primary)]" />
                    {metric}
                  </div>
                ))}
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </div>
          );
        })}
      </section>

      {/* Recent Activity Section */}
      <section className="card p-6 reveal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <button
            className="text-sm text-[color:var(--primary)] hover:underline hover:text-[color:var(--primary)]/80 transition-all duration-200 font-medium px-3 py-1.5 rounded-md hover:bg-[color:var(--primary)]/10 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/20 focus:ring-offset-2"
            onClick={() => navigate('/history')}
            aria-label="View all activity history"
            role="button"
            tabIndex={0}
          >
            View all
          </button>
        </div>

        <div className="space-y-4">
          {recentHistory?.items.length ? recentHistory.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[color:var(--muted)] transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.analysis_type || 'code_review'} analysis — {item.language}
                  {item.complexity ? ` (complexity: ${item.complexity.toFixed(1)})` : ''}
                </p>
                <p className="text-xs text-[color:var(--muted-foreground)]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-[color:var(--muted-foreground)]">
              <p className="text-sm">No recent activity. Run your first analysis!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
