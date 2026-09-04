import { useState, useEffect } from 'react';
import { fetchCollaborationAnalytics } from '../api/collaborationAnalyticsApi';

export const useCollaborationAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCollaborationAnalytics();
      setData(result);
    } catch {
      setError('Failed to fetch collaboration analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};
