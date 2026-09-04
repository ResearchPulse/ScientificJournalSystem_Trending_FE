import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import { useDashboardContext } from '../contexts/DashboardContext';
import FilterDropdown from './FilterDropdown';
import apiClient from '../../../shared/api/axios';
import '../styles/DashboardFilters.css';

const TIMEFRAME_OPTIONS = [
  'Last Year',
  'Last 3 Years',
  'Last 5 Years',
  'Last 10 Years'
];

const REGION_OPTIONS = [
  'Global Distribution',
  'North America',
  'Europe',
  'Asia-Pacific'
];

export default function DashboardFilters() {
  const { t } = useTranslation();
  const { filters, updateFilter, refreshData, loading, projectId } = useDashboardContext();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryProjectId = searchParams.get('project_id') || searchParams.get('projectId');
    const rawProjectId = (projectId && projectId !== 'default-id')
      ? projectId
      : (queryProjectId && queryProjectId !== 'default-id' ? queryProjectId : undefined);

    const cleanProjectId = rawProjectId && !isNaN(Number(rawProjectId))
      ? Number(rawProjectId)
      : undefined;

    const loadCategories = async () => {
      try {
        const res = await apiClient.get(`/analytics/subject-categories`, {
          params: { project_id: cleanProjectId }
        });
        if (res) {
          let items = [];
          if (Array.isArray(res.data)) {
            items = res.data;
          } else if (res.data && Array.isArray(res.data.items)) {
            items = res.data.items;
          } else if (Array.isArray(res.data?.data)) {
            items = res.data.data;
          } else if (Array.isArray(res.data?.data?.items)) {
            items = res.data.data.items;
          } else if (Array.isArray(res)) {
            items = res;
          } else if (Array.isArray(res.items)) {
            items = res.items;
          }

          const mapped = items.map(item => ({
            id: item.id || item.subject_category_id,
            name: item.name || item.display_name
          }));
          setCategories(mapped);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Failed to fetch project subject categories:', err);
        setCategories([]);
      }
    };
    loadCategories();
  }, [projectId]);

  const handleUpdate = () => {
    refreshData();
  };

  return (
    <div className="dashboard-filters">
      <div className="dashboard-filters-top">
        <div className="dashboard-filters-controls">
          <div className="dashboard-filter-label">
            <FiFilter aria-hidden="true" />
            <span>{t('dashboard.filters.label', 'Filters')}</span>
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.timeframe', 'Timeframe')}
              value={filters.timeframe}
              options={TIMEFRAME_OPTIONS}
              onChange={(val) => updateFilter('timeframe', val)}
              defaultValue="Last 5 Years"
              searchable={false}
            />
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.subjectArea', 'Subject Area')}
              value={filters.subject_category}
              options={['All Categories', ...(categories ? categories.map(c => c.name) : [])]}
              onChange={(val) => updateFilter('subject_category', val)}
              defaultValue="All Categories"
              searchable={true}
            />
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.subCategory', 'Sub-Category')}
              value={filters.sub_category}
              options={['All Sub-categories', 'Research', 'Development', 'Innovation', 'Analysis']}
              onChange={(val) => updateFilter('sub_category', val)}
              defaultValue="All Sub-categories"
              searchable={true}
            />
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.zone', 'Zone')}
              value={filters.region}
              options={REGION_OPTIONS}
              onChange={(val) => updateFilter('region', val)}
              defaultValue="Global Distribution"
              searchable={false}
            />
          </div>
        </div>

        <button
          className={`dashboard-update-btn ${loading ? 'loading' : ''}`}
          onClick={handleUpdate}
          disabled={loading}
          aria-live="polite"
        >
          <FiRefreshCw className={`update-icon ${loading ? 'spin' : ''}`} aria-hidden="true" />
          {loading ? t('dashboard.filters.updating', 'Updating...') : t('dashboard.filters.updateAnalysis', 'Update Analysis')}
        </button>
      </div>

      <div className="dashboard-filter-chips">
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.timeframe', 'Timeframe')}:</span>
          <span className="chip-value">{t(`dashboard.filters.${filters.timeframe}`, filters.timeframe)}</span>
        </div>
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.subjectCategory', 'Subject Category')}:</span>
          <span className="chip-value">{t(`dashboard.filters.${filters.subject_category}`, filters.subject_category)}</span>
        </div>
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.subCategory', 'Sub-Category')}:</span>
          <span className="chip-value">{t(`dashboard.filters.${filters.sub_category}`, filters.sub_category)}</span>
        </div>
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.region', 'Region')}:</span>
          <span className="chip-value">{t(`dashboard.filters.${filters.region}`, filters.region)}</span>
        </div>
      </div>
    </div>
  );
}
