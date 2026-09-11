import apiClient from '../../../shared/api/axios';

const getTrend = (growthRate) => {
  if (growthRate > 0) return 'up';
  if (growthRate < 0) return 'down';
  return 'stable';
};

/**
 * Format growthRate as a display string.
 * @param {number} growthRate
 * @returns {string}
 */
const formatTrendValue = (growthRate) => {
  if (growthRate === 0) return 'stable';
  return `${Math.abs(growthRate)}%`;
};

/**
 * Transform API response data into kpiStats array
 * that GlobalStatsSection expects.
 *
 * API shape:
 *   { totalAuthors: { value, growthRate }, totalJournals: { value, growthRate },
 *     densityIndex: { value, status }, totalRelocated: { value, growthRate } }
 *
 * Component shape:
 *   [{ title, value, trend, trendValue }]
 */
export const transformToKpiStats = (data) => {
  if (!data) return [];

  const { totalAuthors, totalJournals, densityIndex, totalRelocated } = data;

  return [
    {
      title: 'TOP AUTHORS',
      value: totalAuthors?.value?.toLocaleString() ?? '0',
      trend: getTrend(totalAuthors?.growthRate ?? 0),
      trendValue: formatTrendValue(totalAuthors?.growthRate ?? 0),
    },
    {
      title: 'INSTITUTIONS',
      value: totalJournals?.value?.toLocaleString() ?? '0',
      trend: getTrend(totalJournals?.growthRate ?? 0),
      trendValue: formatTrendValue(totalJournals?.growthRate ?? 0),
    },
    {
      title: 'DENSITY INDEX',
      value: densityIndex?.value?.toString() ?? '0',
      trend: densityIndex?.status === 'stable' ? 'stable' : (densityIndex?.status === 'up' ? 'up' : 'down'),
      trendValue: densityIndex?.status ?? 'stable',
    },
    {
      title: 'RELOCATED',
      value: totalRelocated?.value?.toLocaleString() ?? '0',
      trend: getTrend(totalRelocated?.growthRate ?? 0),
      trendValue: formatTrendValue(totalRelocated?.growthRate ?? 0),
    },
  ];
};

/**
 * Map API intensity label → numeric value for the heatmap colour scale.
 * The component uses: >80 → PEAK colour, >60 → HIGH, >40 → MED, else LOW.
 *
 * @param {'PEAK'|'HIGH'|'MEDIUM'|'LOW'|string} label
 * @returns {number}
 */
const intensityLabelToNumber = (label) => {
  switch (label?.toUpperCase()) {
    case 'PEAK': return 90;
    case 'HIGH': return 70;
    case 'MEDIUM': return 50;
    case 'LOW': return 30;
    default: return 0;
  }
};

/**
 * Transform geo-distribution API array into the shape GlobalHeatMapSection expects:
 *   [{ country: string, intensity: number }]
 *
 * API item shape: { countryCode: 'US', intensity: 'PEAK', count: 102 }
 *
 * @param {Array} data - raw API array
 * @returns {Array<{country: string, intensity: number}>}
 */
export const transformGeoData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    country: item.countryCode,
    countryCode: item.countryCode,
    countryName: item.countryName,
    regionCode: item.regionCode,
    regionName: item.regionName,
    count: item.count ?? 0,
    intensity: intensityLabelToNumber(item.intensity),
    intensityLabel: item.intensity,
  }));
};

/**
 * Transform distribution API array into the shape ResearchLandscapeCard expects:
 *   [{ name: string, value: number }]
 *
 * API item shape: { name: 'Genomics and Phylogenetic Studies', percentage: 3 }
 *
 * @param {Array} data - raw API array
 * @returns {Array<{name: string, value: number}>}
 */
export const transformDistributionData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    value: item.percentage,
  }));
};

/**
 * Transform top entities API array into the shape TopEntitiesCard expects:
 *   [{ name: string, value: number, displayValue: string }]
 *
 * API item shape: { name: 'American Cancer Society', score: 100 }
 *
 * @param {Array} data - raw API array
 * @returns {Array<{name: string, value: number, displayValue: string}>}
 */
export const transformTopEntitiesData = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name,
    value: item.score,
    displayValue: item.score >= 1000
      ? `${(item.score / 1000).toFixed(1)}k`
      : String(item.score),
  }));
};

/**
 * Helper function to find the quartile group with the highest percentage.
 *
 * @param {Array<{group: string, percentage: number}>} distribution - The quartile distribution array
 * @returns {{group: string, percentage: number} | null} The object with the highest percentage, or null if empty
 */
export const getHighestQuartile = (distribution) => {
  if (!Array.isArray(distribution) || distribution.length === 0) return null;

  return distribution.reduce((max, current) => {
    return (current.percentage || 0) > (max.percentage || 0) ? current : max;
  }, distribution[0]);
};

/**
 * Transform quartiles API response into the shape ImpactQuartilesCard expects.
 *
 * @param {object} data - raw API data
 * @returns {object|null}
 */
export const transformQuartilesData = (data) => {
  if (!data) return null;

  let distribution = data.distribution;
  let totalJournals = data.totalJournals || 0;

  // Handle new API response structure featuring plural "distributions"
  if (!distribution && Array.isArray(data.distributions) && data.distributions.length > 0) {
    const activeRecords = data.distributions.filter(r => (r.total || 0) > 0);
    const latestRecord = activeRecords.length > 0 
      ? [...activeRecords].sort((a, b) => Number(b.year) - Number(a.year))[0]
      : [...data.distributions].sort((a, b) => Number(b.year) - Number(a.year))[0];
      
    if (latestRecord) {
      totalJournals = latestRecord.total || 0;
      distribution = [
        { group: 'Q1 (High Impact)', count: latestRecord.Q1 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord.Q1 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q2 (Moderate)', count: latestRecord.Q2 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord.Q2 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q3 (Standard)', count: latestRecord.Q3 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord.Q3 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q4 (Developing)', count: latestRecord.Q4 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord.Q4 || 0) / totalJournals) * 100) : 0 },
      ];
    }
  }

  if (!Array.isArray(distribution) || distribution.length === 0) return null;

  const highestQ = getHighestQuartile(distribution);
  if (!highestQ) return null;

  // Extract the "Q1", "Q2", "Q3", "Q4" part for the label from "Q1 (High Impact)"
  const labelMatch = highestQ.group.match(/^(Q[1-4])/i);
  const label = labelMatch ? labelMatch[1] : highestQ.group;

  return {
    percentage: highestQ.percentage,
    label: label,
    highestGroup: highestQ,
    totalJournals: totalJournals,
  };
};

/**
 * Maps frontend context filters into backend query parameters
 * @param {object} filters - Frontend filters (timeframe, domain, region)
 * @returns {object} Query parameters (from_year, to_year, subject_area)
 */
export const mapFiltersToQueryParams = (filters) => {
  if (!filters) return {};

  const queryParams = {};

  if (filters.subject_area && filters.subject_area !== 'All Areas') {
    queryParams.subject_area = filters.subject_area;
  } else if (filters.domain && filters.domain !== 'All Domains') {
    queryParams.subject_area = filters.domain;
  }

  if (filters.subject_category && filters.subject_category !== 'All Categories') {
    queryParams.subject_category = filters.subject_category;
    if (!queryParams.subject_area) {
      queryParams.subject_area = filters.subject_category;
    }
  }

  if (filters.zone && filters.zone !== 'Global Distribution') {
    queryParams.zone = filters.zone;
  }

  const currentYear = new Date().getFullYear();
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

/**
 * Fetch dashboard statistics from the real API.
 * @param {number|string} projectId - The project ID (from URL param :id)
 * @returns {Promise<object>}
 */
export const fetchDashboardStats = (projectId) => {
  return apiClient.get('/dashboard/stats', {
    params: { project_id: projectId },
  });
};

/**
 * Fetch geographical distribution data from the real API.
 * @param {number|string} projectId - The project ID (from URL param :id)
 * @param {object} filters - Mapped query filters (e.g. from_year, subject_area)
 * @returns {Promise<object>}
 */
export const fetchGeoDistribution = (projectId, filters = {}) => {
  return apiClient.get('/analytics/geo-distribution', {
    params: { project_id: projectId, ...filters },
  });
};

/**
 * Fetch research landscape distribution data from the real API.
 * @param {number|string} projectId - The project ID (from URL param :id)
 * @param {object} filters - Mapped query filters (e.g. from_year, subject_area)
 * @returns {Promise<object>}
 */
export const fetchDistribution = (projectId, filters = {}) => {
  return apiClient.get('/analytics/distribution', {
    params: { project_id: projectId, ...filters },
  });
};

/**
 * Fetch top entities ranking data from the real API.
 * @param {number|string} projectId - The project ID (from URL param :id)
 * @param {object} options - Optional parameters including limit and mapped query filters
 * @returns {Promise<object>}
 */
export const fetchTopEntities = (projectId, options = {}) => {
  const { limit = 4, ...filters } = options;
  return apiClient.get('/analytics/top-entities', {
    params: { project_id: projectId, limit, ...filters },
  });
};

/**
 * Fetch journal quartile distribution data from the real API.
 * @param {number|string} projectId - The project ID (from URL param :id)
 * @param {object} filters - Mapped query filters (e.g. from_year, subject_area)
 * @returns {Promise<object>}
 */
export const fetchQuartiles = (projectId, filters = {}) => {
  return apiClient.get('/analytics/journals/quartiles', {
    params: { project_id: projectId, ...filters },
  });
};
