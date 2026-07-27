import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../shared/components/common/Card';
import { MdTrendingUp, MdFlashOn } from 'react-icons/md';
import styles from '../../styles/Analytics.module.css';

/**
 * Container for summary metrics cards
 */
export const SummaryCards = ({ summary = {} }) => {
  const { t } = useTranslation();
  const {
    averageImpactFactor = 0,
    percentageChange = '+0.0%',
    trackedCount = 0,
    limit = 100
  } = summary;

  const usagePercentage = limit > 0 ? Math.min(100, Math.round((trackedCount / limit) * 100)) : 0;

  // Calculate next sync countdown (sync occurs at 00:00 every day)
  const getNextSyncCountdown = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diffMs = tomorrow - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return t('analytics.nextUpdateIn', { 
      hours: diffHrs, 
      minutes: diffMins, 
      defaultValue: `Next update in ${diffHrs}h ${diffMins}m` 
    });
  };

  return (
    <div className={styles.summaryCardsContainer}>
      
      {/* Average IF Score Card */}
      <Card className={styles.summaryCard}>
        <div className={styles.summaryCardHeader}>
          <span>{t('analytics.avgIfScore', 'Average IF Score')}</span>
          <MdTrendingUp size={20} color="var(--color-primary-orange, #ff6b00)" />
        </div>
        <div className={styles.summaryCardValue}>{averageImpactFactor.toFixed(2)}</div>
        <div className={styles.summaryCardSubtext}>
          {t('analytics.changeFromLastPeriod', { 
            change: percentageChange, 
            defaultValue: `${percentageChange} from last period` 
          })}
        </div>
      </Card>

      {/* Tracking Usage Card */}
      <Card className={styles.summaryCard}>
        <div className={styles.summaryCardHeader}>
          <span>{t('analytics.trackingUsage', 'Tracking Usage')}</span>
        </div>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill} style={{ width: `${usagePercentage}%` }}></div>
        </div>
        <div className={styles.summaryCardSubtext}>
          {t('analytics.limitReached', { 
            count: trackedCount, 
            limit: limit, 
            defaultValue: `${trackedCount} / ${limit} limit reached` 
          })}
        </div>
      </Card>

      {/* Auto-Refresh Status Card */}
      <Card className={styles.summaryCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%' }}>
          <div className={styles.autoRefreshIcon}>
            <MdFlashOn />
          </div>
          <div className={styles.autoRefreshContent}>
            <h3>{t('analytics.autoRefreshActive', 'Auto-Refresh Active')}</h3>
            <p className={styles.summaryCardSubtext} style={{ margin: 0 }}>{getNextSyncCountdown()}</p>
          </div>
        </div>
      </Card>

    </div>
  );
};
