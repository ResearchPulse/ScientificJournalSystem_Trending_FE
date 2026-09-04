/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children, projectId }) => {
  const [filters, setFilters] = useState({
    timeframe: 'Last 5 Years',
    domain: 'All Domains',
    subject_category: 'All Categories',
    sub_category: 'All Sub-categories',
    region: 'Global Distribution'
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const value = {
    projectId,
    filters,
    updateFilter,
    refreshTrigger,
    refreshData,
    loading,
    setLoading
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
