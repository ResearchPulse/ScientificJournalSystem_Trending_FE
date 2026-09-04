import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../shared/api/axios';
import {
  fetchDashboardStats,
  fetchGeoDistribution,
  fetchDistribution,
  fetchTopEntities,
  fetchQuartiles
} from '../../../../features/global-ecosystem/services/globalEcosystem.service';
import { fetchDevelopmentTrendsData } from '../../../../features/development-trends/services/developmentTrends.service';
import {
  getTopJournalRanking,
  getQuartileDistribution,
  getImpactMatrix,
  getMigrationAnalysis
} from '../../../../features/journals/services/journals.service';
import { analyticsService } from '../../../../features/analytics/services/analyticsService';
import { saveProjectCache } from '../../../utils/cacheStorage';
import './AnalysisPreloader.css';

const defaultFilters = {
  timeframe: 'Last 5 Years',
  domain: 'All Domains',
  subject_category: 'All Categories',
  region: 'Global Distribution'
};

const mapFiltersToParams = (filters) => {
  if (!filters) return {};
  const queryParams = {};
  
  if (filters.subject_category && filters.subject_category !== 'All Categories') {
    queryParams.subject_area = filters.subject_category;
  } else if (filters.domain && filters.domain !== 'All Domains') {
    queryParams.subject_area = filters.domain;
  }
  
  const currentYear = new Date().getFullYear() - 1;
  if (filters.timeframe) {
    switch (filters.timeframe) {
      case 'Last Year':
        queryParams.from_year = currentYear - 1;
        queryParams.to_year = currentYear;
        break;
      case 'Last 3 Years':
        queryParams.from_year = currentYear - 3;
        queryParams.to_year = currentYear;
        break;
      case 'Last 5 Years':
        queryParams.from_year = currentYear - 5;
        queryParams.to_year = currentYear;
        break;
      case 'Last 10 Years':
        queryParams.from_year = currentYear - 10;
        queryParams.to_year = currentYear;
        break;
      default:
        break;
    }
  }
  return queryParams;
};

export default function AnalysisPreloader({ projectId, onComplete }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const logEndRef = useRef(null);

  const [logs, setLogs] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const mappedFilters = mapFiltersToParams(defaultFilters);

  const queries = [
    // 1. Dashboard - Global Ecosystem
    {
      id: 'stats',
      name: 'Dashboard KPI Statistics',
      queryKey: ['dashboard-stats', projectId, 0],
      queryFn: () => fetchDashboardStats(projectId)
    },
    {
      id: 'geo-distribution',
      name: 'Geographical Distribution Map',
      queryKey: ['geoDistribution', projectId, mappedFilters, 0],
      queryFn: () => fetchGeoDistribution(projectId, mappedFilters)
    },
    {
      id: 'distribution',
      name: 'Research Landscape Distribution',
      queryKey: ['distribution', projectId, mappedFilters, 0],
      queryFn: () => fetchDistribution(projectId, mappedFilters)
    },
    {
      id: 'top-entities',
      name: 'Top Research Entities',
      queryKey: ['topEntities', projectId, { limit: 4, ...mappedFilters }, 0],
      queryFn: () => fetchTopEntities(projectId, { limit: 4, ...mappedFilters })
    },
    {
      id: 'quartiles',
      name: 'Impact Quartiles Classification',
      queryKey: ['quartilesDistribution', projectId, mappedFilters, 0],
      queryFn: () => fetchQuartiles(projectId, mappedFilters)
    },
    // 2. Dashboard - Development & Trends
    {
      id: 'development-trends',
      name: 'Development & Trends Main Payload',
      queryKey: ['developmentTrends', projectId, defaultFilters, 0],
      queryFn: () => fetchDevelopmentTrendsData(projectId, defaultFilters)
    },
    // 3. Journals
    {
      id: 'journal-ranking',
      name: 'Top Journal Rankings',
      queryKey: ['journals', 'ranking', projectId, mappedFilters, 0],
      queryFn: () => getTopJournalRanking({ ...mappedFilters, project_id: projectId })
    },
    {
      id: 'journal-quartiles',
      name: 'Journal Quartiles Distribution',
      queryKey: ['journals', 'quartiles', projectId, mappedFilters, 0],
      queryFn: () => getQuartileDistribution({ ...mappedFilters, project_id: projectId })
    },
    {
      id: 'journal-impact',
      name: 'SJR vs H-Index Impact Matrix',
      queryKey: ['journals', 'impact-matrix', projectId, mappedFilters, 0],
      queryFn: () => getImpactMatrix({ ...mappedFilters, project_id: projectId })
    },
    {
      id: 'journal-migration',
      name: 'Open Access Migration Analysis',
      queryKey: ['journals', 'migration', projectId, mappedFilters, 0],
      queryFn: () => getMigrationAnalysis({ ...mappedFilters, project_id: projectId })
    },
    // 4. Volumes - Journal Metrics
    {
      id: 'volume-rankings',
      name: 'Influential Collaborator Rankings',
      queryKey: ['collaboration', 'rankings', projectId],
      queryFn: () => apiClient.get('/analytics/rankings', { params: { project_id: projectId, limit: 10 } })
    },
    {
      id: 'volume-productivity',
      name: 'Author Productivity vs Impact Matrix',
      queryKey: ['collaboration', 'productivity-matrix', projectId],
      queryFn: () => apiClient.get('/analytics/matrix/productivity', { params: { project_id: projectId } })
    },
    {
      id: 'volume-metrics',
      name: 'Collaboration Network Metrics',
      queryKey: ['collaboration', 'metrics', projectId],
      queryFn: () => apiClient.get('/analytics/network/collab-metrics', { params: { project_id: projectId } })
    },
    {
      id: 'volume-network',
      name: 'Global Collaboration Graph',
      queryKey: ['collaboration', 'global-network', projectId],
      queryFn: () => apiClient.get('/analytics/network/collaboration', { params: { project_id: projectId } })
    },
    {
      id: 'volume-intensity-author',
      name: 'Topic Intensity Matrix (Author)',
      queryKey: ['collaboration', 'topic-intensity', projectId, 'author'],
      queryFn: () => apiClient.get('/analytics/matrix/intensity', { params: { project_id: projectId, row_type: 'author' } })
    },
    {
      id: 'volume-intensity-inst',
      name: 'Topic Intensity Matrix (Institution)',
      queryKey: ['collaboration', 'topic-intensity', projectId, 'institution'],
      queryFn: () => apiClient.get('/analytics/matrix/intensity', { params: { project_id: projectId, row_type: 'institution' } })
    },
    // 5. Volumes - Keywords & Networks
    {
      id: 'keyword-vectors',
      name: 'Keyword Trend Vectors Map',
      queryKey: ['keywordVectors', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/keywords/vectors', { params: { project_id: projectId, ...mappedFilters } })
    },
    {
      id: 'keyword-chord',
      name: 'Country Collaboration Chord Graph',
      queryKey: ['countryCollaboration', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/network/chord', { params: { project_id: projectId, ...mappedFilters } })
    },
    {
      id: 'keyword-insights',
      name: 'Collaboration Insights Indicators',
      queryKey: ['collaborationInsights', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/network/collab-insights', { params: { project_id: projectId, ...mappedFilters } })
    },
    {
      id: 'keyword-topology',
      name: 'Conceptual Proximity Network Graph',
      queryKey: ['networkTopology', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/network/topology', { params: { project_id: projectId, network_type: 'conceptual', ...mappedFilters } })
    },
    {
      id: 'keyword-cross-links',
      name: 'Domain Cross-Links Distribution',
      queryKey: ['crossLinks', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/network/cross-links', { params: { project_id: projectId, ...mappedFilters } })
    },
    {
      id: 'keyword-temporal',
      name: 'Temporal Cluster Shift Analysis',
      queryKey: ['temporalShift', projectId, mappedFilters, 0],
      queryFn: () => apiClient.get('/analytics/network/temporal-shift', { params: { project_id: projectId, ...mappedFilters } })
    },
    // 6. Analytics (Theo dõi)
    {
      id: 'tracked-journals-paginated',
      name: 'Tracked Journals (Page 1)',
      queryKey: ['trackedJournals', projectId, 1, 4],
      queryFn: async () => {
        const response = await apiClient.get('/analytics/journals/ranking', {
          params: { project_id: projectId, page: 1, limit: 4 }
        });
        const rawData = response?.data || response;
        if (rawData && rawData.data && (rawData.data.journals || rawData.data.pagination)) {
          return rawData.data;
        }
        return rawData;
      }
    },
    {
      id: 'curated-articles-page-1',
      name: 'Curated Articles (Page 1)',
      queryKey: ['curatedArticles', projectId, 1, {}],
      queryFn: async () => {
        const res = await analyticsService.fetchCuratedArticles({ project_id: projectId, page: 1, limit: 10 });
        if (!res) return { items: [], totalPages: 1, total: 0, currentPage: 1 };
        const data = res.data && res.data.data !== undefined ? res.data.data : (res.data !== undefined ? res.data : res);
        return data || { items: [], totalPages: 1, total: 0, currentPage: 1 };
      }
    },
    {
      id: 'project-keywords',
      name: 'Project Target Keywords',
      queryKey: ['projectKeywords', projectId],
      queryFn: async () => {
        const res = await analyticsService.fetchKeywords({ project_id: projectId });
        if (!res) return [];
        const data = res.data && res.data.data !== undefined ? res.data.data : (res.data !== undefined ? res.data : res);
        return data || [];
      }
    },
    {
      id: 'tracked-journals-full-list',
      name: 'Tracked Journals Watchlist',
      queryKey: ['trackedJournalsFullList', projectId],
      queryFn: async () => {
        const res = await analyticsService.fetchTrackedJournals({ project_id: projectId });
        if (!res) return [];
        const data = res.data && res.data.data !== undefined ? res.data.data : (res.data !== undefined ? res.data : res);
        return data || [];
      }
    }
  ];

  const total = queries.length;

  useEffect(() => {
    let active = true;
    setCompletedCount(0);
    
    // Initial logs setup
    const initialLogs = queries.map(q => ({
      id: q.id,
      name: q.name,
      status: 'LOADING',
      error: null
    }));
    setLogs(initialLogs);

    const prefetch = async () => {
      let count = 0;
      const concurrencyLimit = 3;
      const queue = [...queries];
      
      const worker = async () => {
        while (queue.length > 0) {
          if (!active) break;
          const q = queue.shift();
          if (!q) continue;
          
          let success = false;
          while (!success && active) {
            try {
              await queryClient.fetchQuery({
                queryKey: q.queryKey,
                queryFn: q.queryFn,
                staleTime: 30 * 60 * 1000,
                gcTime: 60 * 60 * 1000
              });
              
              if (!active) return;
              success = true;
              count++;
              setCompletedCount(count);
              setLogs(prev => prev.map(log => log.id === q.id ? { ...log, status: 'DONE', error: null } : log));
            } catch (err) {
              if (!active) return;
              // Log the error but keep the status as LOADING (or show RETRYING)
              setLogs(prev => prev.map(log => log.id === q.id ? { ...log, status: 'LOADING', error: `${err?.message || 'Error'}` } : log));
              // Wait 2 seconds before retrying
              await new Promise(r => setTimeout(r, 2000));
            }
          }
        }
      };

      const workers = Array.from({ length: concurrencyLimit }, () => worker());
      await Promise.all(workers);
    };

    prefetch();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, retryTrigger, queryClient]);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const failedQueries = logs.filter(l => l.status === 'ERROR');
  const hasErrors = failedQueries.length > 0;
  const isFinished = completedCount === total && total > 0;

  useEffect(() => {
    if (isFinished && !hasErrors) {
      saveProjectCache(projectId, queryClient);
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        const completeTimer = setTimeout(() => {
          onComplete();
        }, 600);
        return () => clearTimeout(completeTimer);
      }, 800);
      return () => clearTimeout(fadeTimer);
    }
  }, [isFinished, hasErrors, onComplete, projectId, queryClient]);

  const handleRetryFailed = () => {
    setLogs(prev => prev.map(log => log.status === 'ERROR' ? { ...log, status: 'LOADING', error: null } : log));
    setRetryTrigger(prev => prev + 1);
  };

  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Find the most recently completed task or current loading task
  const lastCompleted = [...logs].reverse().find(l => l.status === 'DONE');
  const currentLoading = logs.find(l => l.status === 'LOADING');
  
  let statusText;
  if (hasErrors && isFinished) {
    statusText = t('dashboard.preloaderErrorStatus', 'Quá trình phân tích gặp sự cố ở một vài hạng mục.');
  } else if (lastCompleted) {
    statusText = t('dashboard.preloaderDoneItem', 'Đã phân tích xong: {{item}}...', { item: lastCompleted.name });
  } else if (currentLoading) {
    statusText = currentLoading.error
      ? t('dashboard.preloaderRetryingItem', 'Đang tải lại (Lỗi: {{error}}): {{item}}...', { item: currentLoading.name, error: currentLoading.error })
      : t('dashboard.preloaderLoadingItem', 'Đang xử lý: {{item}}...', { item: currentLoading.name });
  } else {
    statusText = t('dashboard.preloaderStarting', 'Đang khởi tạo hệ thống...');
  }

  return (
    <div className={`preloader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="preloader-container">
        <div className="preloader-header">
          <div className="preloader-spinner-icon">
            <div className="spinner-ring"></div>
          </div>
          <h1 className="preloader-title">
            {t('dashboard.preloaderTitleFriendly', 'Hệ thống đang phân tích dữ liệu')}
          </h1>
          <p className="preloader-subtitle">
            {t('dashboard.preloaderSubtitleFriendly', 'Vui lòng đợi trong ít phút để chúng tôi tổng hợp thông tin dự án...')}
          </p>
        </div>

        <div className="preloader-progress-section">
          <div className="progress-info">
            <span className="progress-percent">{percent}%</span>
            <span className="progress-fraction">{completedCount} / {total}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
          </div>
          <div className="preloader-status-text">
            {statusText}
          </div>
        </div>

        {hasErrors && isFinished && (
          <div className="preloader-error-panel">
            <div className="error-title">
              ⚠️ {t('dashboard.preloaderErrorsFriendly', 'Một vài dữ liệu không thể tải được')}
            </div>
            <div className="preloader-actions">
              <button className="btn-preloader primary" onClick={handleRetryFailed}>
                {t('dashboard.retryFailed', 'Thử lại')}
              </button>
              <button className="btn-preloader secondary" onClick={onComplete}>
                {t('dashboard.proceedAnyway', 'Tiếp tục xem trang')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
