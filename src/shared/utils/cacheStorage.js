const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Save all queries for a given project to localStorage
 * @param {string} projectId 
 * @param {import('@tanstack/react-query').QueryClient} queryClient 
 */
export const saveProjectCache = (projectId, queryClient) => {
  if (!projectId) return;

  try {
    const allQueries = queryClient.getQueryCache().getAll();
    const cacheItems = [];

    allQueries.forEach(query => {
      // Check if query is related to this project
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey.includes(projectId)) {
        cacheItems.push({
          queryKey: query.queryKey,
          data: query.state.data,
          updatedAt: query.state.dataUpdatedAt
        });
      }
    });

    const payload = {
      timestamp: Date.now(),
      items: cacheItems
    };

    localStorage.setItem(`project_analytics_cache_${projectId}`, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save analytics cache to localStorage:', error);
  }
};

/**
 * Load and hydrate queries for a given project from localStorage if within 1 hour
 * @param {string} projectId 
 * @param {import('@tanstack/react-query').QueryClient} queryClient 
 * @returns {boolean} True if cache was valid and restored, false otherwise
 */
export const loadProjectCache = (projectId, queryClient) => {
  if (!projectId) return false;

  try {
    const raw = localStorage.getItem(`project_analytics_cache_${projectId}`);
    if (!raw) return false;

    const payload = JSON.parse(raw);
    const { timestamp, items } = payload || {};

    if (!timestamp || !Array.isArray(items)) return false;

    // Check 1-hour expiration
    if (Date.now() - timestamp > ONE_HOUR_MS) {
      localStorage.removeItem(`project_analytics_cache_${projectId}`);
      return false;
    }

    // Hydrate QueryClient
    items.forEach(item => {
      if (item.queryKey && item.data !== undefined) {
        queryClient.setQueryData(item.queryKey, item.data, {
          updatedAt: item.updatedAt || timestamp
        });
      }
    });

    return true;
  } catch (error) {
    console.warn('Failed to restore analytics cache from localStorage:', error);
    return false;
  }
};

/**
 * Clear cache for a specific project
 * @param {string} projectId 
 */
export const clearProjectCache = (projectId) => {
  if (!projectId) return;
  try {
    localStorage.removeItem(`project_analytics_cache_${projectId}`);
  } catch {
    // Ignore error
  }
};
