import React, { useCallback } from 'react';
import { GeoJSON } from 'react-leaflet';
import { renderMapTooltip } from './MapTooltip';

// Helper maps
const REVERSE_NAME_MAP = {
  'United States of America': 'US',
  'United Kingdom': 'GB',
  'Vietnam': 'VN',
  'China': 'CN',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Romania': 'RO',
  'Hungary': 'HU',
  'Greece': 'GR',
  'Ireland': 'IE',
  'Russia': 'RU',
  'Ukraine': 'UA',
  'Turkey': 'TR',
  'India': 'IN',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Thailand': 'THA',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Taiwan': 'TW',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Canada': 'CA',
  'Mexico': 'MX',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'South Africa': 'ZA',
  'Egypt': 'EG',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  'Israel': 'IL',
  'Iran': 'IR',
  'Iraq': 'IQ',
};

const INTENSITY_COLORS = {
  PEAK: '#EA580C',
  HIGH: '#F97316',
  MEDIUM: '#FB923C',
  LOW: '#FFE6C7',
};

const getIntensityColor = (intensity) => {
  if (typeof intensity === 'number') {
    if (intensity > 80) return '#EA580C';
    if (intensity > 60) return '#F97316';
    if (intensity > 40) return '#FB923C';
    return '#FFE6C7';
  }
  return INTENSITY_COLORS[String(intensity)?.toUpperCase()] || '#4A5568';
};

const getIntensityLabel = (intensity) => {
  if (typeof intensity === 'number') {
    if (intensity > 80) return 'PEAK';
    if (intensity > 60) return 'HIGH';
    if (intensity > 40) return 'MEDIUM';
    if (intensity > 0) return 'LOW';
    return 'No data';
  }
  return intensity || 'No data';
};

export default function WorldMap({
  worldGeos,
  heatMapData,
  selectedCountryCode,
  provinceStatus,
  onCountryChange,
}) {
  const getStyle = useCallback(
    (feature) => {
      const geoName = feature.properties.name;
      const alpha2 = REVERSE_NAME_MAP[geoName];
      const isSelected = selectedCountryCode && alpha2 === selectedCountryCode;
      const isDimmed = selectedCountryCode && !isSelected;

      if (isSelected && provinceStatus === 'done') {
        return { fillOpacity: 0, opacity: 0, weight: 0 };
      }

      const item = heatMapData[geoName];
      const fillColor = item?.intensity ? getIntensityColor(item.intensity) : '#4A5568';

      return {
        fillColor,
        fillOpacity: isDimmed ? 0.16 : 0.9,
        color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.25)',
        weight: isSelected ? 1.5 : 0.6,
        opacity: isDimmed ? 0.16 : 1,
      };
    },
    [heatMapData, selectedCountryCode, provinceStatus]
  );

  const onEachFeature = useCallback(
    (feature, layer) => {
      const geoName = feature.properties.name;
      const alpha2 = REVERSE_NAME_MAP[geoName];
      const item = heatMapData[geoName];

      layer.on({
        click: () => {
          if (alpha2) {
            onCountryChange(selectedCountryCode === alpha2 ? '' : alpha2);
          }
        },
        mouseover: (e) => {
          const isDimmed = selectedCountryCode && alpha2 !== selectedCountryCode;
          const isProvincesShowing = selectedCountryCode === alpha2 && provinceStatus === 'done';
          if (!isDimmed && !isProvincesShowing) {
            e.target.setStyle({
              fillColor: item?.intensity ? '#FBBF24' : '#64748B',
              color: '#FFFFFF',
              weight: 1.2,
            });
          }
        },
        mouseout: (e) => {
          e.target.setStyle(getStyle(feature));
        },
      });

      const valueText = item ? `${item.count?.toLocaleString() || 0} publications` : 'No data';
      const rankText = item ? (item.intensityLabel || getIntensityLabel(item.intensity)) : 'No data';
      const badgeColor = item ? getIntensityColor(item.intensity) : '#64748b';

      const html = renderMapTooltip({
        title: geoName,
        subtitle: alpha2 ? `Code: ${alpha2}` : '',
        value: valueText,
        intensity: rankText,
        badgeColor,
      });

      layer.bindTooltip(html, { sticky: true, className: 'map-tooltip-container' });
    },
    [heatMapData, onCountryChange, selectedCountryCode, provinceStatus, getStyle]
  );

  return (
    <GeoJSON
      key={`world-${selectedCountryCode}-${provinceStatus}`}
      data={worldGeos}
      style={getStyle}
      onEachFeature={onEachFeature}
    />
  );
}
