import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CollaborationAnalytics.css';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, Label } from 'recharts';
import { FiList, FiBarChart2 } from 'react-icons/fi';

const CustomTooltip = ({ active, payload }) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#1e293b', fontSize: '13px' }}>{payload[0].payload.rawName}</p>
        <p style={{ margin: 0, color: '#1b2432', fontWeight: '600', fontSize: '13px' }}>{t('volume.citations', 'Citations')}: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const LeadingInstitutionsCard = ({ data }) => {
  const { t } = useTranslation();
  const [isChartView, setIsChartView] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!isChartView) {
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isChartView]);

  const chartData = data?.slice(0, 10).map(item => ({
    name: item.name,
    score: item.score !== undefined ? Number(item.score).toFixed(1) : 0,
    rawName: item.name
  })) || [];

  return (
    <div className="ca-card">
      <div className="ca-card-header">
        <h3 className="ca-card-title">{t('volume.leadingInstitutions', 'Leading Institutions')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Toggle View Button */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => {
                if (isChartView) {
                  setAnimate(false);
                  setIsChartView(false);
                }
              }}
              title={t('volume.listView', 'List View')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '5px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: !isChartView ? 'white' : 'transparent',
                color: !isChartView ? '#1b2432' : '#94a3b8',
                boxShadow: !isChartView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }}
            >
              <FiList />
            </button>
            <button
              onClick={() => setIsChartView(true)}
              title={t('volume.chartView', 'Chart View')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '5px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                background: isChartView ? 'white' : 'transparent',
                color: isChartView ? '#1b2432' : '#94a3b8',
                boxShadow: isChartView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                fontSize: '15px'
              }}
            >
              <FiBarChart2 />
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {!isChartView && (
        <div>
          {!data || data.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
              {t('volume.noInstitutionsFound', 'No institutions found for this project.')}
            </div>
          ) : (
            data.slice(0, 5).map((item, index) => {
              const rankStr = (index + 1).toString().padStart(2, '0');
              const score = item.score !== undefined ? Number(item.score).toFixed(1) : 0;
              return (
                <div key={index} className="ca-list-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="ca-list-item-left">
                      <span className="ca-list-rank">{rankStr}</span>
                      <span className="ca-list-name">{item.name}</span>
                    </div>
                    <div>
                      <span className="ca-list-score" style={{ color: '#1b2432' }}>{score}</span>
                      <span className="ca-list-label" style={{ marginLeft: '4px', color: '#1b2432' }}>{t('volume.citations', 'Citations')}</span>
                    </div>
                  </div>
                  <div className="ca-list-bar-container">
                    <div 
                      className="ca-list-bar" 
                      style={{ 
                        width: animate ? `${Math.min(100, Math.max(0, score))}%` : '0%', 
                        backgroundColor: '#1b2432',
                        transition: 'width 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CHART VIEW */}
      {isChartView && (
        <div style={{ width: '100%', height: '260px', marginTop: '16px' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 30, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                  dy={5}
                >
                  <Label value={t('volume.institution', 'INSTITUTION')} position="insideBottom" offset={-30} style={{ textAnchor: 'middle', fontSize: 10, fill: '#94a3b8', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }} />
                </XAxis>
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                >
                  <Label value={t('volume.citationsUpper', 'CITATIONS')} angle={-90} position="insideLeft" offset={-20} style={{ textAnchor: 'middle', fontSize: 10, fill: '#94a3b8', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }} />
                </YAxis>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f4f8' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={38}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#1b2432" fillOpacity={1 - index * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>
              {t('volume.noData', 'No data available')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadingInstitutionsCard;
