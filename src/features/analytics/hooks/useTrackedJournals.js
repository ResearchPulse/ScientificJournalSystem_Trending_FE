import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';

/**
 * React Query hook to fetch paginated tracked journals and summary metrics
 * @param {string|number} projectId - ID of the project
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export const useTrackedJournalsQuery = (projectId, page = 1, limit = 4) => {
  return useQuery({
    queryKey: ['trackedJournals', projectId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/journals/ranking', {
        params: {
          project_id: projectId,
          page,
          limit,
        },
      });
      // Handle axios interceptor that might unwrap to response or response.data
      const rawData = response?.data || response;
      if (rawData && rawData.data && (rawData.data.journals || rawData.data.pagination)) {
        return rawData.data;
      }
      return rawData;
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    placeholderData: keepPreviousData,
  });
};
