import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiMaximize, FiX } from 'react-icons/fi';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useFrontierDetectionQuery } from '../hooks/useFrontierDetectionQuery';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';

const CustomTooltip = ({ active, payload }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="frontier-tooltip">
        <p className="frontier-tooltip-topic">{data.topic}</p>
        <p className="frontier-tooltip-metric">{t('dashboard.impact', 'Impact')}: <span>{data.impact}</span></p>
        <p className="frontier-tooltip-metric">{t('dashboard.velocity', 'Velocity')}: <span>{data.velocity}</span></p>
      </div>
    );
  }
  return null;
};

const truncateText = (text, maxLength = 12) => {
  const str = String(text || '').trim();
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
};

const CustomNode = (props) => {
  const { cx, cy, payload } = props;
  const { t } = useTranslation();
  const isFrontier = payload.isFrontier;
  
  const width = isFrontier ? 100 : 80;
  const height = isFrontier ? 50 : 36;
  const label = truncateText(payload.topic, isFrontier ? 15 : 12);
  
  if (isFrontier) {
    return (
      <g transform={`translate(${cx - width/2}, ${cy - height/2})`}>
        <rect width={width} height={height} rx={8} fill="#ffedd5" stroke="#f97316" strokeWidth={2} />
        <text x={width/2} y={height/2 - 4} textAnchor="middle" fill="#9a3412" fontSize={10} fontWeight={700}>{label}</text>
        <text x={width/2} y={height/2 + 10} textAnchor="middle" fill="#c2410c" fontSize={8} fontWeight={600}>{t('dashboard.frontierLabel', 'FRONTIER')}</text>
      </g>
    );
  }

  return (
    <g transform={`translate(${cx - width/2}, ${cy - height/2})`}>
      <rect width={width} height={height} rx={8} fill="#f8fafc" stroke="#94a3b8" strokeWidth={1} />
      <text x={width/2} y={height/2 + 4} textAnchor="middle" fill="#475569" fontSize={9} fontWeight={600}>{label}</text>
    </g>
  );
};

const ScatterVisualization = ({ data }) => {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
        <XAxis 
          type="number" 
          dataKey="velocity" 
          name="Velocity Score" 
          domain={[0, 10]}
          tick={false}
          tickLine={false}
          axisLine={false}
          label={{ value: t('dashboard.citationVelocityUpper', 'CITATION VELOCITY'), position: 'bottom', offset: 0, fill: 'var(--color-neutral-500)', fontSize: 10, fontWeight: 600, letterSpacing: '1px' }}
        />
        <YAxis 
          type="number" 
          dataKey="impact" 
          name="Impact Score" 
          domain={[0, 10]}
          tick={false}
          tickLine={false}
          axisLine={false}
          label={{ value: t('dashboard.impactFactorUpper', 'IMPACT FACTOR'), angle: -90, position: 'left', offset: 0, fill: 'var(--color-neutral-500)', fontSize: 10, fontWeight: 600, letterSpacing: '1px' }}
        />
        <ZAxis type="number" dataKey="size" range={[200, 1500]} name="Research Volume" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
        <Scatter name="Topics" data={data} shape={<CustomNode />} animationDuration={1500} />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default function FrontierDetectionCard() {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();
  const { data, isLoading, error } = useFrontierDetectionQuery(projectId, filters, refreshTrigger);

  if (isLoading && !data) {
    return (
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title-group">
            <h3 className="analytics-card-title">{t('dashboard.frontierDetection', 'Frontier Detection')}</h3>
            <p className="analytics-card-subtitle">{t('dashboard.frontierDetectionSub', 'Emerging topics by velocity and impact')}</p>
          </div>
        </div>
        <LoadingSkeleton height="300px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="analytics-card">
        <InlineErrorState 
          message={t('dashboard.frontierError', 'Failed to load frontier detection')}
          onRetry={refreshData}
        />
      </div>
    );
  }

  const rawData = data?.items || [];

  if (rawData.length === 0) {
    return (
      <div className="analytics-card">
        <div className="analytics-card-header">
          <div className="analytics-card-title-group">
            <h3 className="analytics-card-title">{t('dashboard.frontierDetection', 'Frontier Detection')}</h3>
            <p className="analytics-card-subtitle">{t('dashboard.frontierDetectionSub', 'Emerging topics by velocity and impact')}</p>
          </div>
        </div>
        <div className="analytics-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-body)' }}>
          {t('dashboard.noDataForFilters', 'No data matches the current filters.')}
        </div>
      </div>
    );
  }

  const chartData = rawData.map(d => ({
    topic: d.label,
    velocity: d.citationVelocity || 50,
    impact: d.impactVelocity || 60,
    size: 100,
    isFrontier: String(d.status).toLowerCase() === 'frontier'
  }));

  // Sort by velocity to ensure rendering flow is consistent
  chartData.sort((a, b) => a.velocity - b.velocity);

  return (
    <div className="analytics-card">
      <div className="analytics-card-header">
        <div className="analytics-card-title-group">
          <h3 className="analytics-card-title">{t('dashboard.frontierDetection', 'Frontier Detection')}</h3>
          <p className="analytics-card-subtitle">{t('dashboard.frontierDetectionSub', 'Emerging topics by velocity and impact')}</p>
        </div>
      </div>
      <div className="analytics-card-body">
        <div className="frontier-chart-wrapper" aria-label="Frontier Detection Scatter Plot">
          <button 
            className="frontier-expand-btn" 
            onClick={() => setIsExpanded(true)}
            aria-label="Expand chart"
          >
            <FiMaximize />
          </button>
          <ScatterVisualization data={chartData} />
        </div>

        {isExpanded && (
          <div className="frontier-modal-overlay" onClick={() => setIsExpanded(false)}>
            <div className="frontier-modal-content" onClick={e => e.stopPropagation()}>
              <div className="frontier-modal-header">
                <h3>{t('dashboard.frontierDetection', 'Frontier Detection')}</h3>
                <button 
                  className="frontier-close-btn" 
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close modal"
                >
                  <FiX />
                </button>
              </div>
              <div className="frontier-modal-body">
                <ScatterVisualization data={chartData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
