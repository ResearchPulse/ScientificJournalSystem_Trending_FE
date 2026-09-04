import React, { useState, useEffect } from 'react';
import { Outlet, useParams, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from '../sidebar/Sidebar';
import AppHeader from './AppHeader/AppHeader';
import { DashboardProvider } from '../../../features/dashboard/contexts/DashboardContext';
import AnalysisPreloader from './AnalysisPreloader/AnalysisPreloader';
import { loadProjectCache, saveProjectCache } from '../../utils/cacheStorage';

/**
 * DashboardLayout - Shared layout component.
 * Includes the Sidebar, Header, and Main Content area.
 */
const DashboardLayout = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [loadedProjectId, setLoadedProjectId] = useState(null);

  const navigate = useNavigate();
  const { lang } = useParams();
  const currentLang = lang || 'en';

  useEffect(() => {
    if (id && id !== loadedProjectId) {
      // Attempt to load from localStorage cache first
      const hasCachedData = loadProjectCache(id, queryClient);
      if (hasCachedData) {
        setLoadedProjectId(id);
      } else {
        setLoadedProjectId(null);
      }
    }
  }, [id, loadedProjectId, queryClient]);

  const handlePreloadComplete = () => {
    setLoadedProjectId(id);
  };

  useEffect(() => {
    const isIndex = window.location.pathname.replace(/\/$/, '') === `/${currentLang}/project/${id}`;
    
    if (loadedProjectId === id) {
      if (isIndex) {
        navigate(`/${currentLang}/project/${id}/dashboard`, { replace: true });
      }
    } else {
      if (!isIndex) {
        navigate(`/${currentLang}/project/${id}`, { replace: true });
      }
    }
  }, [loadedProjectId, id, currentLang, navigate]);

  // Automatically sync react-query cache to localStorage when queries succeed
  useEffect(() => {
    if (!id) return;

    let timer;
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'success') {
        clearTimeout(timer);
        timer = setTimeout(() => {
          saveProjectCache(id, queryClient);
        }, 1000); // 1-second debounce
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [id, queryClient]);

  if (id === 'default-id') {
    return <Navigate to="/projects" replace />;
  }

  return (
    <DashboardProvider projectId={id}>
      {loadedProjectId === id ? (
        <div className="app-container">
          <Sidebar />
          <div className="app-main-content-wrapper">
            <AppHeader />
            <main className="app-main-content">
              <Outlet /> 
            </main>
          </div>
        </div>
      ) : (
        <AnalysisPreloader projectId={id} onComplete={handlePreloadComplete} />
      )}
    </DashboardProvider>
  );
};

export default DashboardLayout;
