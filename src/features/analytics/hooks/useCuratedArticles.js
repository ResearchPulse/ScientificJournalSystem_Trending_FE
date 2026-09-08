import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

const extractData = (res) => {
  if (!res) return null;
  if (res.data && res.data.data !== undefined) {
    return res.data.data;
  }
  if (res.data !== undefined) {
    return res.data;
  }
  return res;
};

/**
 * Hook to manage curated articles state using TanStack Query caching
 */
export const useCuratedArticles = (projectId, page = 1, filters = {}) => {
  const queryClient = useQueryClient();

  // Query 1: Curated Articles (paginated & filtered)
  const articlesQuery = useQuery({
    queryKey: ['curatedArticles', projectId, page, filters],
    queryFn: async () => {
      const res = await analyticsService.fetchCuratedArticles({
        project_id: projectId,
        page,
        limit: 10,
        ...filters,
      });
      return extractData(res) || { items: [], totalPages: 1, total: 0, currentPage: 1 };
    },
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Query 2: Keywords
  const keywordsQuery = useQuery({
    queryKey: ['projectKeywords', projectId],
    queryFn: async () => {
      const res = await analyticsService.fetchKeywords({ project_id: projectId });
      return extractData(res) || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  // Query 3: Tracked Journals
  const journalsQuery = useQuery({
    queryKey: ['trackedJournalsFullList', projectId],
    queryFn: async () => {
      const res = await analyticsService.fetchTrackedJournals({ project_id: projectId });
      return extractData(res) || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  const refetch = () => {
    articlesQuery.refetch();
    keywordsQuery.refetch();
    journalsQuery.refetch();
  };

  const articlesData = articlesQuery.data || { items: [], totalPages: 1, total: 0, currentPage: 1 };

  // Helper for updating keywords local cache easily
  const setKeywords = (newKeywords) => {
    queryClient.setQueryData(['projectKeywords', projectId], newKeywords);
  };

  return {
    articles: articlesData.items || [],
    pagination: {
      totalPages: articlesData.totalPages || 1,
      total: articlesData.total || 0,
      currentPage: articlesData.currentPage || 1,
    },
    keywords: keywordsQuery.data || [],
    setKeywords,
    journals: journalsQuery.data || [],
    loading: articlesQuery.isLoading || keywordsQuery.isLoading || journalsQuery.isLoading,
    error: articlesQuery.error?.message || keywordsQuery.error?.message || journalsQuery.error?.message || null,
    refetch,
  };
};
