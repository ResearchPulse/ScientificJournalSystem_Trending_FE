import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CollaborationAnalytics.css';

const AuthorImpactMatrix = ({ data }) => {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState(null);

  if (!Array.isArray(data)) {
    return (
      <div className="ca-card">
        <div className="ca-card-header">
          <h3 className="ca-card-title">{t('volume.authorProductivityVsImpact', 'Author Productivity vs Impact Matrix')}</h3>
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
          {t('volume.noData', 'No data available for this project.')}
        </div>
      </div>
    );
  }

  return (
    <div className="ca-card" style={{ position: 'relative' }}>
      <div className="ca-card-header">
        <h3 className="ca-card-title">{t('volume.authorProductivityVsImpact', 'Author Productivity vs Impact Matrix')}</h3>
      </div>
      
      <div className="ca-matrix-container">
        {/* Grid lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '1px', background: 'var(--color-neutral-200)' }}></div>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--color-neutral-200)' }}></div>
          <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '1px', background: 'var(--color-neutral-200)' }}></div>
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', background: 'var(--color-neutral-200)' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--color-neutral-200)' }}></div>
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '1px', background: 'var(--color-neutral-200)' }}></div>
        </div>
        
        {/* Empty state overlay */}
        {data.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#94a3b8', zIndex: 1 }}>
            {t('volume.noData', 'No data available for this project.')}
          </div>
        )}

        {/* Plot points */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          {data.map((point, idx) => {
            const numId = Number(point.id) || (idx + 1);
            const jitterX = (Math.sin(numId * 12.9898) * 43758.5453) % 1; 
            const jitterY = (Math.cos(numId * 78.233) * 43758.5453) % 1;
            const finalX = Math.max(1, Math.min(99, (Number(point.x) || 0) + jitterX * 1.5));
            const finalY = Math.max(1, Math.min(99, (Number(point.y) || 0) + jitterY * 1.5));

            return (
              <circle
                key={point.id || idx}
                cx={`${finalX}%`}
                cy={`${100 - finalY}%`}
                r={(point.r || 5) * 1.5}
                fill="none"
                stroke="#ff6b00"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const svgEl = e.currentTarget.closest('svg');
                  const svgRect = svgEl.getBoundingClientRect();
                  const cx = e.clientX - svgRect.left;
                  const cy = e.clientY - svgRect.top;
                  setTooltip({ point, cx, cy });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (() => {
          const { point, cx, cy } = tooltip;
          const tooltipW = 220;
          const parentEl = document.querySelector('.ca-matrix-container');
          const parentW = parentEl ? parentEl.clientWidth : 600;
          const left = cx + tooltipW > parentW ? cx - tooltipW - 10 : cx + 10;
          return (
            <div
              style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${cy - 10}px`,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                width: `${tooltipW}px`,
                zIndex: 100,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '10px 14px',
                background: '#fff7f0',
                borderBottom: '2px solid #ff6b00',
                fontWeight: 700,
                fontSize: '13px',
                color: '#1e293b',
              }}>
                {point.authorName || `${t('volume.authorId', 'Author ID')}: ${point.authorId}`}
              </div>
              {/* Rows */}
              <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>{t('volume.type', 'Type')}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{t('volume.authorLabel', 'Author')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>{t('volume.hIndex', 'H-Index')}</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{point.hIndex}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>{t('volume.articleOutputYearly', 'Article Output (Yearly)')}</span>
                  <span style={{ fontWeight: 700, color: '#ff6b00' }}>{point.yearlyOutput}</span>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="ca-matrix-axis-x">{t('volume.articleOutputYearlyUpper', 'ARTICLE OUTPUT (YEARLY)')}</div>
        <div className="ca-matrix-axis-y">{t('volume.impactFactorHindexUpper', 'IMPACT FACTOR (H-INDEX)')}</div>
      </div>
    </div>
  );
};

export default AuthorImpactMatrix;
