import React from 'react';
import { useTranslation } from 'react-i18next';
import DashboardFooter from '../../../shared/components/layout/DashboardFooter';
import VolumeAnalyticsTabs from '../components/keywords-networks/VolumeAnalyticsTabs';
import CoreClustersCard from '../components/keywords-networks/CoreClustersCard';
import KeywordTrendVectorsChart from '../components/keywords-networks/KeywordTrendVectorsChart';
import CountryCollaborationChord from '../components/keywords-networks/CountryCollaborationChord';
import CollaborationInsightsCard from '../components/keywords-networks/CollaborationInsightsCard';
import ConceptualProximityCard from '../components/keywords-networks/ConceptualProximityCard';
import DomainCrossLinksCard from '../components/keywords-networks/DomainCrossLinksCard';
import TemporalClusterShiftCard from '../components/keywords-networks/TemporalClusterShiftCard';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import ErrorStateSection from '../../../shared/components/common/ErrorStateSection';
import {
  useKeywordVectorsQuery,
  useCountryCollaborationQuery,
  useCollaborationInsightsQuery,
  useNetworkTopologyQuery,
  useCrossLinksQuery,
  useTemporalShiftQuery
} from '../hooks/useKeywordsNetworksQuery';
import '../components/keywords-networks/KeywordsNetworks.css';

const KeywordsNetworksPage = () => {
  const { t } = useTranslation();
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();

  const { data: keywordVectors, isLoading: isVectorsLoading, error: vectorsError } = useKeywordVectorsQuery(projectId, { ...filters, windowMonths: 12 }, refreshTrigger);
  const { data: countryCollab, isLoading: isCollabLoading, error: collabError } = useCountryCollaborationQuery(projectId, filters, refreshTrigger);
  const { data: collabInsights, isLoading: isInsightsLoading, error: insightsError } = useCollaborationInsightsQuery(projectId, filters, refreshTrigger);
  const { data: topology, isLoading: isTopologyLoading, error: topologyError } = useNetworkTopologyQuery(projectId, filters, refreshTrigger);
  const { data: crossLinks, isLoading: isCrossLoading, error: crossError } = useCrossLinksQuery(projectId, filters, refreshTrigger);
  const { data: temporalShift, isLoading: isTemporalLoading, error: temporalError } = useTemporalShiftQuery(projectId, filters, refreshTrigger);

  const hasData = keywordVectors && countryCollab && collabInsights && topology && crossLinks && temporalShift;
  const isLoading = (isVectorsLoading || isCollabLoading || isInsightsLoading || isTopologyLoading || isCrossLoading || isTemporalLoading) && !hasData;
  const hasError = vectorsError || collabError || insightsError || topologyError || crossError || temporalError;

  return (
    <>
      <div className="kn-page">
        <VolumeAnalyticsTabs />
        
        {isLoading ? (
          <div className="kn-loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
            <div className="update-icon spin" style={{ width: '24px', height: '24px', border: '3px solid var(--color-primary-orange)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
            <div>{t('common.loading', 'Loading...')}</div>
          </div>
        ) : hasError ? (
          <ErrorStateSection 
            title={t('common.error', 'Analytics Loading Failed')}
            message={t('dashboard.loadingFailedDesc', 'Unable to load keyword and networks analytics. Please check your connection or try again.')}
            onRetry={refreshData}
            minHeight={400}
          />
        ) : (
          <div className="kn-layout">
            <div className="kn-row kn-row-1">
              <CoreClustersCard data={keywordVectors} />
              <KeywordTrendVectorsChart 
                data={keywordVectors} 
              />
            </div>
            
            <div className="kn-row kn-row-2">
              <CountryCollaborationChord data={countryCollab} />
              <CollaborationInsightsCard data={collabInsights} projectId={projectId} filters={filters} />
            </div>
            
            <div className="kn-row kn-row-3">
              <ConceptualProximityCard data={topology} />
              <DomainCrossLinksCard data={crossLinks} />
              <TemporalClusterShiftCard data={temporalShift} />
            </div>
          </div>
        )}
      </div>
      <DashboardFooter />
    </>
  );
};

export default KeywordsNetworksPage;
