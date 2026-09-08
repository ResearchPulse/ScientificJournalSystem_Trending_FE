import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const KeywordTrendVectorsChart = ({ data, timeframe, onTimeframeChange }) => {
  const { t } = useTranslation();

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="kn-card">
        <div className="kn-card-header">
          <div>
            <h2 className="kn-card-title">{t('volume.keywordTrendVectors', 'Keyword Trend Vectors')}</h2>
            <p className="kn-card-subtitle">{t('volume.frontierTopicAcceleration', 'Frontier topic acceleration over the last 12 months')}</p>
          </div>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250, color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
          {t('volume.noTrendVectorData', 'No trend vector data available for the selected timeframe.')}
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.keyword || item.name,
    value: item.volume !== undefined ? item.volume : (item.value || 0)
  }));

  return (
    <div className="kn-card">
      <div className="kn-card-header">
        <div>
          <h2 className="kn-card-title">{t('volume.keywordTrendVectors', 'Keyword Trend Vectors')}</h2>
          <p className="kn-card-subtitle">{t('volume.frontierTopicAcceleration', 'Frontier topic acceleration over the last 12 months')}</p>
        </div>

      </div>
      <div style={{ width: '100%', height: 250, marginTop: '24px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-neutral-500)' }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'var(--color-neutral-100)' }} contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="value" fill="var(--color-primary-orange)" background={{ fill: '#EADDD7' }} radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KeywordTrendVectorsChart;
