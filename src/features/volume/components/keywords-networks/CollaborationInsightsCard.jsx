import { useTranslation } from 'react-i18next';
import { FiDownload } from 'react-icons/fi';

const MoleculeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'white', display: 'block', marginBottom: '16px' }}>
    <circle cx="12" cy="7" r="3.5" fill="white" />
    <circle cx="6" cy="15" r="3" fill="white" />
    <circle cx="18" cy="15" r="3" fill="white" />
    <circle cx="12" cy="16" r="2" fill="white" />
    <line x1="12" y1="7" x2="6" y2="15" stroke="white" strokeWidth="2.5" />
    <line x1="12" y1="7" x2="18" y2="15" stroke="white" strokeWidth="2.5" />
    <line x1="12" y1="7" x2="12" y2="16" stroke="white" strokeWidth="2.5" />
  </svg>
);

const RocketIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-orange)', display: 'block' }}>
    <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2 3.8 12.2a3 3 0 0 0 0 4.2l.8.8a3 3 0 0 0 4.2 0L19 7" />
    <path d="M12 12c2-2 5-2 7-4l3-3-3-3-3 3c-2 2-2 5-4 7Z" />
    <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-orange)', display: 'block' }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CollaborationInsightsCard = ({ data, projectId, filters }) => {
  const { t } = useTranslation();
  const description = data?.description || t('volume.insightsDefaultDesc', 'Global research output has shifted significantly towards multi-national clusters, with Japan and the EU showing the highest reciprocal citation growth of 18% YoY.');
  const emergingLink = data?.emergingLink || 'BRICS + Inequality';
  const criticalNode = data?.criticalNode || 'Random walk';

  const handleExport = () => {
    const searchParams = new URLSearchParams();
    if (projectId) searchParams.set('project_id', String(projectId));
    
    // Map filters to parameters matching getCountryCollaborationChord Schema
    const currentYear = new Date().getFullYear() - 1;
    if (filters?.timeframe) {
      let from_year, to_year;
      switch (filters.timeframe) {
        case 'Last Year':
          from_year = currentYear - 1;
          to_year = currentYear;
          break;
        case 'Last 3 Years':
          from_year = currentYear - 3;
          to_year = currentYear;
          break;
        case 'Last 5 Years':
          from_year = currentYear - 5;
          to_year = currentYear;
          break;
        case 'Last 10 Years':
          from_year = currentYear - 10;
          to_year = currentYear;
          break;
        default:
          break;
      }
      if (from_year && to_year) {
        searchParams.set('from_year', String(from_year));
        searchParams.set('to_year', String(to_year));
      }
    }
    if (filters?.subject_category && filters.subject_category !== 'All Categories') {
      searchParams.set('subject_area', filters.subject_category);
    }

    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    window.location.href = `${baseURL}/analytics/network/chord/export?${searchParams.toString()}`;
  };

  return (
    <div className="kn-card" style={{ backgroundColor: 'var(--color-primary-orange)', border: 'none', justifyContent: 'space-between' }}>
      <div style={{ marginBottom: '24px' }}>
        <MoleculeIcon />
        
        {/* Custom title class without h2 to bypass global dark styling rules */}
        <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px', color: '#ffffff' }}>
          {t('volume.collaborationInsights', 'Collaboration Insights')}
        </div>
        
        <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#ffffff', opacity: 0.9 }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <RocketIcon />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('volume.emergingLink', 'EMERGING LINK')}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{emergingLink}</div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPinIcon />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('volume.criticalNode', 'CRITICAL NODE')}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{criticalNode}</div>
          </div>
        </div>
      </div>


      <button onClick={handleExport} className="kn-btn-primary" style={{ backgroundColor: '#111827', color: 'white', borderRadius: '6px', padding: '14px', fontSize: '0.875rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {t('volume.exportRawMatrix', 'Export Raw Matrix')} <FiDownload style={{ opacity: 0.7 }} />
      </button>
    </div>
  );
};

export default CollaborationInsightsCard;
