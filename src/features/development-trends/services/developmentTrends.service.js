import apiClient from '../../../shared/api/axios';

/**
 * Fetch development trends data from the API.
 * @param {string|number} projectId - The project ID
 * @param {object} filters - Frontend filters (timeframe, domain, subject_category, region)
 * @returns {Promise<object>} The server response containing development trends data
 */
export const fetchDevelopmentTrendsData = (projectId, filters = {}) => {
  const cleanProjectId = projectId && projectId !== 'default-id' ? projectId : undefined;
  
  return apiClient.get('/analytics/development-trends', {
    params: {
      project_id: cleanProjectId,
      timeframe: filters?.timeframe,
      subject_area: filters?.subject_area && filters.subject_area !== 'All Areas' ? filters.subject_area : undefined,
      domain: filters?.subject_area && filters.subject_area !== 'All Areas' ? filters.subject_area : (filters?.domain && filters.domain !== 'All Domains' ? filters.domain : undefined),
      subject_category: filters?.subject_category && filters.subject_category !== 'All Categories' ? filters.subject_category : undefined,
      zone: filters?.zone && filters.zone !== 'Global Distribution' ? filters.zone : undefined
    }
  });
};
