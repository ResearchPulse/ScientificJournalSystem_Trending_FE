import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';
import { Tabs } from '../components/Tabs/Tabs';
import { JournalTable } from '../components/JournalTable/JournalTable';
import { SummaryCards } from '../components/SummaryCards/SummaryCards';
import DashboardFooter from '../../../shared/components/layout/DashboardFooter';
import { useTrackedJournalsQuery } from '../hooks/useTrackedJournals';
import styles from '../styles/Analytics.module.css';

/**
 * ---------------------------------------------------------
 * Analytics Dashboard
 *
 * Displays the Scientia Analytics overview page.
 *
 * Issue:
 * #53
 *
 * Author:
 * Team Scientia
 * ---------------------------------------------------------
 */
export const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const projectId = id === 'default-id' ? '1' : id;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 4; // Matches the design displaying 4 journals per page

  const { data, isLoading, error } = useTrackedJournalsQuery(projectId, page, limit);

  const journals = data?.journals || data?.data?.journals || [];
  const pagination = data?.pagination || data?.data?.pagination || { totalCount: 0, page, limit, totalPages: 0 };
  const summary = data?.summary || data?.data?.summary || { averageImpactFactor: 0, percentageChange: '+0.0%', trackedCount: 0, limit: 100 };

  // Prefetch next page in background for instantaneous page switching
  useEffect(() => {
    if (pagination.totalCount && page * limit < pagination.totalCount) {
      const nextPage = page + 1;
      queryClient.prefetchQuery({
        queryKey: ['trackedJournals', projectId, nextPage, limit],
        queryFn: async () => {
          const response = await apiClient.get('/analytics/journals/ranking', {
            params: { project_id: projectId, page: nextPage, limit },
          });
          const rawData = response?.data || response;
          if (rawData && rawData.data && (rawData.data.journals || rawData.data.pagination)) {
            return rawData.data;
          }
          return rawData;
        },
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [page, limit, pagination.totalCount, projectId, queryClient]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => (prev * limit < pagination.totalCount ? prev + 1 : prev));
  };

  const hasData = journals.length > 0;
  const showLoading = isLoading && !hasData;

  return (
    <div className={styles.analyticsPage}>
      <Tabs />

      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>{t('analytics.trackedJournals', 'Tracked Journals')}</h2>
          <p className={styles.pageDescription}>
            {t('analytics.trackedJournalsDesc', 'Manage your watchlist for bibliometric monitoring. These journals are currently indexed for real-time impact factor updates and citation frequency alerts.')}
          </p>
        </div>
      </div>

      <div className={styles.pageContent}>
        {showLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
            <div className="update-icon spin" style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-orange)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '14px' }}>{t('common.loading', 'Loading tracked journals...')}</div>
          </div>
        ) : error && !hasData ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '12px', border: 'var(--border-light)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
            <div style={{ color: '#ef4444', fontSize: '16px', fontWeight: 'bold' }}>{t('common.error', 'Error Loading Data')}</div>
            <div style={{ color: 'var(--color-neutral-500)', fontSize: '14px' }}>{error.message || t('analytics.unableToConnect', 'Unable to connect to the server.')}</div>
          </div>
        ) : (
          <>
            <JournalTable
              journals={journals}
              page={page}
              limit={limit}
              totalCount={pagination.totalCount}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
            />

            <SummaryCards summary={summary} />
          </>
        )}
      </div>
      <DashboardFooter />
    </div>
  );
};

export default AnalyticsDashboard;
