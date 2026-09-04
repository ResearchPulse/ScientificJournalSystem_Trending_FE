import apiClient from '../../../shared/api/axios';
import {
  quartileDistribution,
  impactMatrixData,
  migrationAnalysis
} from '../constants/journals.mock';

export const getTopJournalRanking = async (params) => {
  const response = await apiClient.get('/analytics/journals/ranking', { params });
  // Handle format: { data: { items: [...] } } or { items: [...] }
  return response.data || response;
};

export const getQuartileDistribution = async (params) => {
  const response = await apiClient.get('/analytics/journals/quartiles', { params });
  const rawData = response.data || response;
  
  // Transform from { distributions: [...] } to { totalJournals, distribution }
  if (rawData && Array.isArray(rawData.distributions) && rawData.distributions.length > 0) {
    const activeRecords = rawData.distributions.filter(r => (r.total || 0) > 0);
    const latestRecord = activeRecords.length > 0
      ? [...activeRecords].sort((a, b) => Number(b.year) - Number(a.year))[0]
      : [...rawData.distributions].sort((a, b) => Number(b.year) - Number(a.year))[0];
      
    const totalJournals = latestRecord?.total || 0;
    return {
      totalJournals,
      distribution: [
        { group: 'Q1 (High Impact)', count: latestRecord?.Q1 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord?.Q1 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q2 (Moderate)', count: latestRecord?.Q2 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord?.Q2 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q3 (Standard)', count: latestRecord?.Q3 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord?.Q3 || 0) / totalJournals) * 100) : 0 },
        { group: 'Q4 (Developing)', count: latestRecord?.Q4 || 0, percentage: totalJournals > 0 ? Math.round(((latestRecord?.Q4 || 0) / totalJournals) * 100) : 0 },
      ]
    };
  }
  return rawData;
};

export const getImpactMatrix = async (params) => {
  const response = await apiClient.get('/analytics/journals/impact-matrix', { params });
  // Dữ liệu API trả về đã có sẵn: journalName, sjrCitationScore, hIndex, quartile, size
  return response.data || response;
};

export const getMigrationAnalysis = async (params) => {
  const response = await apiClient.get('/analytics/journals/migration', { params });
  return response.data || response;
};

export const fetchJournalsData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        quartileDistribution,
        topJournals: [], // We won't use this anymore
        impactMatrixData,
        migrationAnalysis
      });
    }, 1000);
  });
};
