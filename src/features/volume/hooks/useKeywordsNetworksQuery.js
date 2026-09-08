import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';

/**
 * Helper function to map Frontend filters to Backend query parameters.
 */
const mapFiltersToParams = (filters) => {
  if (!filters) return {};
  const queryParams = {};
  
  if (filters.subject_category && filters.subject_category !== 'All Categories') {
    queryParams.subject_area = filters.subject_category;
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

// 1. Keyword Vectors (Core Clusters & Trend Vectors chart)
export const useKeywordVectorsQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['keywordVectors', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/keywords/vectors', {
      params: { project_id: projectId, ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => (Array.isArray(response?.data) ? response.data : []),
  });
};

// 2. Country Collaboration Chord
export const useCountryCollaborationQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['countryCollaboration', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/network/chord', {
      params: { project_id: projectId, ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response?.data,
  });
};

// 3. Collaboration Insights
export const useCollaborationInsightsQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['collaborationInsights', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/network/collab-insights', {
      params: { project_id: projectId, ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response?.data,
  });
};

// 4. Network Topology (Conceptual Proximity network card)
export const useNetworkTopologyQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['networkTopology', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/network/topology', {
      params: { project_id: projectId, network_type: 'conceptual', ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response?.data,
  });
};

// 5. Cross Links
export const useCrossLinksQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['crossLinks', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/network/cross-links', {
      params: { project_id: projectId, ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response?.data,
  });
};

// 6. Temporal Shift
export const useTemporalShiftQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryParams = mapFiltersToParams(filters);
  return useQuery({
    queryKey: ['temporalShift', projectId, queryParams, refreshTrigger],
    queryFn: () => apiClient.get('/analytics/network/temporal-shift', {
      params: { project_id: projectId, ...queryParams }
    }),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (response) => response?.data,
  });
};
