import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../../../../shared/api/axios';
import './CollaborationAnalytics.css';

const CollaborationHeader = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const projectId = id === 'default-id' ? '1' : id;

  const handleExportData = async () => {
    try {
      const response = await apiClient.get('/analytics/network/collab-report/export', {
        params: { project_id: projectId },
        responseType: 'blob', // important for file download
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `collaboration_analytics_report_${projectId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export data', error);
      alert(t('volume.failedToExport', 'Failed to export data'));
    }
  };



  return (
    <div className="ca-header">
      <div className="ca-title-group">
        <h1>{t('volume.collaborationAnalytics', 'Collaboration Analytics')}</h1>
        <p>{t('volume.collaborationAnalyticsDesc', 'Exploring the intricate networks and impact footprints of global academic authors and research institutions through bibliometric synthesis.')}</p>
      </div>
      <div className="ca-header-actions">
        <button className="ca-btn-dark" onClick={handleExportData}>{t('volume.exportData', 'EXPORT DATA')}</button>
      </div>
    </div>
  );
};

export default CollaborationHeader;
