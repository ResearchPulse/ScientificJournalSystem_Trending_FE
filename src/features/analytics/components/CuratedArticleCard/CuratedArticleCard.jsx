import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../styles/curatedArticles.module.css';
import { AccessBadge } from '../../../../shared/components/common/AccessBadge';

/**
 * CuratedArticleCard Component
 * Displays individual article details in the Curated Articles page.
 * 
 * @param {Object} props
 * @param {Object} props.article - Article data object
 */
export const CuratedArticleCard = ({ article }) => {
  const { t, i18n } = useTranslation();

  const handleViewDetails = () => {
    const lang = i18n.language || 'vi';
    const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || '';
    const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // Construct URL: BASE_URL/lang/articles/id
    window.open(`${sanitizedBaseUrl}/${lang}/articles/${article.id}`, '_blank');
  };

  return (
    <div className={styles.articleCard}>
      <div className={styles.cardHeader}>
        <AccessBadge isOpenAccess={article.isOpenAccess} />
      </div>

      <div>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.authors}>{article.authors}</p>
      </div>

      <p className={styles.description}>{article.description}</p>

      <div className={styles.cardFooter}>
        <span className={styles.publishedYear}>
          {t('analytics.publishedAt', { year: article.publishedYear, defaultValue: `Published ${article.publishedYear}` })}
        </span>
        <button className={styles.viewBtn} onClick={handleViewDetails}>
          {t('analytics.viewDetails', 'View Details')}
        </button>
      </div>
    </div>
  );
};
