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

export default function DashboardFilters() {
  const { t } = useTranslation();
  const { filters, updateFilter, updateFilters, refreshData, loading, projectId } = useDashboardContext();
  const [hierarchy, setHierarchy] = useState([]);
  const [zoneOptions, setZoneOptions] = useState(['Global Distribution']);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await apiClient.get('/analytics/zones');
        const data = res?.data?.data || res?.data || res;
        const regions = Array.isArray(data?.regions) ? data.regions.map(r => r.name) : [];
        const countries = Array.isArray(data?.countries) ? data.countries.map(c => c.name) : [];
        setZoneOptions(['Global Distribution', ...regions, ...countries]);
      } catch (err) {
        console.error('Failed to fetch zones:', err);
      }
    };
    loadZones();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryProjectId = searchParams.get('project_id') || searchParams.get('projectId');
    const rawProjectId = (projectId && projectId !== 'default-id')
      ? projectId
      : (queryProjectId && queryProjectId !== 'default-id' ? queryProjectId : undefined);

    const cleanProjectId = rawProjectId && !isNaN(Number(rawProjectId))
      ? Number(rawProjectId)
      : undefined;

    const loadSubjectAreasHierarchy = async () => {
      try {
        const res = await apiClient.get('/analytics/subject-areas', {
          params: { project_id: cleanProjectId }
        });
        const payload = res?.data?.data || res?.data || res;
        const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
        setHierarchy(items);
      } catch (err) {
        console.error('Failed to fetch subject areas hierarchy:', err);
        setHierarchy([]);
      }
    };
    loadSubjectAreasHierarchy();
  }, [projectId]);

  // Compute Area options
  const areaOptions = ['All Areas', ...hierarchy.map(h => h.name)];

  // Compute dependent Category options based on selected Subject Area
  const categoryOptions = React.useMemo(() => {
    const selectedArea = filters.subject_area;
    if (!selectedArea || selectedArea === 'All Areas') {
      // Gather all unique categories across all areas
      const catSet = new Set();
      hierarchy.forEach(area => {
        (area.categories || []).forEach(cat => {
          if (cat?.name) catSet.add(cat.name);
        });
      });
      return ['All Categories', ...Array.from(catSet).sort()];
    }

    const matchedArea = hierarchy.find(
      a => a.name?.toLowerCase() === selectedArea.toLowerCase()
    );
    if (!matchedArea || !Array.isArray(matchedArea.categories)) {
      return ['All Categories'];
    }

    return ['All Categories', ...matchedArea.categories.map(c => c.name)];
  }, [hierarchy, filters.subject_area]);

  // Handle Subject Area change: update area and automatically reset category
  const handleAreaChange = (newArea) => {
    if (updateFilters) {
      updateFilters({
        subject_area: newArea,
        subject_category: 'All Categories'
      });
    } else {
      updateFilter('subject_area', newArea);
      updateFilter('subject_category', 'All Categories');
    }
  };

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
              value={filters.subject_area || 'All Areas'}
              options={areaOptions}
              onChange={handleAreaChange}
              defaultValue="All Areas"
              searchable={true}
            />
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.subjectCategory', 'Subject Category')}
              value={filters.subject_category || 'All Categories'}
              options={categoryOptions}
              onChange={(val) => updateFilter('subject_category', val)}
              defaultValue="All Categories"
              searchable={true}
            />
          </div>

          <div className="dashboard-filter-group">
            <FilterDropdown
              title={t('dashboard.filters.zone', 'Zone / Region')}
              value={filters.zone || 'Global Distribution'}
              options={zoneOptions}
              onChange={(val) => updateFilter('zone', val)}
              defaultValue="Global Distribution"
              searchable={true}
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
          <span className="chip-label">{t('dashboard.filters.subjectArea', 'Subject Area')}:</span>
          <span className="chip-value">{filters.subject_area || 'All Areas'}</span>
        </div>
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.subjectCategory', 'Subject Category')}:</span>
          <span className="chip-value">{t(`dashboard.filters.${filters.subject_category}`, filters.subject_category || 'All Categories')}</span>
        </div>
        <div className="dashboard-chip">
          <span className="chip-label">{t('dashboard.filters.zone', 'Zone')}:</span>
          <span className="chip-value">{filters.zone || 'Global Distribution'}</span>
        </div>
      </div>
    </div>
  );
}
