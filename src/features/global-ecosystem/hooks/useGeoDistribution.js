import { useQuery } from '@tanstack/react-query';
import { fetchGeoDistribution, transformGeoData } from '../services/globalEcosystem.service';

export const useGeoDistribution = (projectId, filters = {}, refreshTrigger, options = {}) => {
    return useQuery({
        queryKey: ['geoDistribution', projectId, filters, refreshTrigger],
        queryFn: () => fetchGeoDistribution(projectId, filters),
        enabled: !!projectId && (options.enabled !== undefined ? options.enabled : true),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,   // 10 phút
        refetchOnWindowFocus: false,
        select: (response) => {
            return transformGeoData(response?.data);
        },
        ...options
    });
};
