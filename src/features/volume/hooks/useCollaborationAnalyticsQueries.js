import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/axios';

/**
 * @typedef {Object} TopEntity
 * @property {string} name
 * @property {number} score
 */

/**
 * Fetch Influential Rankings (Authors and Institutions)
 * @param {string} projectId 
 */
export const useInfluentialRankingsQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'rankings', projectId],
    queryFn: () => apiClient.get('/analytics/rankings', {
      params: { project_id: projectId, limit: 10 }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => response?.data || { authors: [], institutions: [] },
  });
};

/**
 * Fetch Author Productivity vs Impact Matrix (Scatter Plot)
 * @param {string} projectId 
 */
export const useAuthorProductivityMatrixQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'productivity-matrix', projectId],
    queryFn: () => apiClient.get('/analytics/matrix/productivity', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const data = response?.data || [];
      if (!data.length) return [];
      
      // Tìm giá trị max thực tế
      const rawMaxX = Math.max(...data.map(d => d.yearlyOutput));
      const rawMaxY = Math.max(...data.map(d => d.hIndex));
      
      // Thêm padding 10% và thiết lập giá trị min để tránh gom cụm toàn bộ vào cạnh phải (100%)
      const maxX = Math.max(5, rawMaxX * 1.1);
      const maxY = Math.max(5, rawMaxY * 1.1);
      
      return data.map((d, index) => ({
        id: d.authorId || index,
        authorId: d.authorId || `#${index + 1}`,
        authorName: d.authorName || null,
        hIndex: d.hIndex ?? 0,
        yearlyOutput: d.yearlyOutput ?? 0,
        x: maxX > 0 ? (d.yearlyOutput / maxX) * 100 : 0,
        y: maxY > 0 ? (d.hIndex / maxY) * 100 : 0,
        r: 5,
        type: 'author'
      }));
    }
  });
};

/**
 * Fetch Collaboration Insights (Key Insights)
 * @param {string} projectId 
 */
export const useCollaborationInsightsQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'metrics', projectId],
    queryFn: () => apiClient.get('/analytics/network/collab-metrics', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => response?.data || null,
  });
};

/**
 * Fetch Global Collaboration Network (Network Graph)
 * @param {string} projectId 
 */
export const useGlobalCollaborationNetworkQuery = (projectId) => {
  return useQuery({
    queryKey: ['collaboration', 'global-network', projectId],
    queryFn: () => apiClient.get('/analytics/network/collaboration', {
      params: { project_id: projectId }
    }),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const data = response?.data || { nodes: [], edges: [] };
      
      // Assign circular layout coordinates if not present
      const nodes = data.nodes || [];
      const edges = data.edges || [];
      
      const mappedNodes = nodes.map((node) => {
        return {
          ...node,
          id: node.id,
          type: node.type === 'AUTHOR' ? 'author' : 'institution',
          val: node.size // Đổi tên thuộc tính size -> val để ForceGraph2D tự tính kích thước
        };
      });
      
      const mappedLinks = edges.map(edge => ({
        ...edge,
        source: edge.source || edge.from,
        target: edge.target || edge.to
      }));

      return { nodes: mappedNodes, links: mappedLinks };
    }
  });
};

/**
 * Fetch Topic Intensity Matrix (Heatmap)
 * @param {string} projectId 
 * @param {string} type - 'author' | 'institution'
 */
export const useTopicIntensityMatrixQuery = (projectId, type) => {
  return useQuery({
    queryKey: ['collaboration', 'topic-intensity', projectId, type],
    queryFn: () => apiClient.get('/analytics/matrix/intensity', {
      params: { project_id: projectId, row_type: type }
    }),
    enabled: !!projectId && !!type,
    staleTime: 5 * 60 * 1000,
    select: (response) => {
      const rawData = response?.data || [];
      if (!Array.isArray(rawData) || rawData.length === 0) return null;
      
      const rowsSet = new Set();
      const colsSet = new Set();
      
      rawData.forEach(item => {
        if (item.rowName) rowsSet.add(item.rowName);
        if (item.topic) colsSet.add(item.topic);
      });
      
      const rows = Array.from(rowsSet);
      const columns = Array.from(colsSet);
      
      const dataMatrix = rows.map(r => {
        return columns.map(c => {
          const cell = rawData.find(item => item.rowName === r && item.topic === c);
          return cell ? cell.intensity : 0;
        });
      });
      
      return { columns, rows, data: dataMatrix };
    }
  });
};
