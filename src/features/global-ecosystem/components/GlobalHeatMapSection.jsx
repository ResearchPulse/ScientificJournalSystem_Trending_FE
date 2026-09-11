import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDashboardContext } from '../../dashboard/contexts/DashboardContext';
import { useGeoDistribution } from '../hooks/useGeoDistribution';
import { mapFiltersToQueryParams } from '../services/globalEcosystem.service';
import apiClient from '../../../shared/api/axios';
import LoadingSkeleton from '../../../shared/components/common/LoadingSkeleton';
import InlineErrorState from '../../../shared/components/common/InlineErrorState';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Comprehensive ISO 3166-1 alpha-2 → react-simple-maps country name mapping
const NAME_MAP = {
  'US': 'United States of America',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'VN': 'Vietnam',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'South Korea',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'PT': 'Portugal',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'RO': 'Romania',
  'HU': 'Hungary',
  'GR': 'Greece',
  'IE': 'Ireland',
  'RU': 'Russia',
  'UA': 'Ukraine',
  'TR': 'Turkey',
  'IN': 'India',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'AU': 'Australia',
  'NZ': 'New Zealand',
  'CA': 'Canada',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
  'IR': 'Iran',
  'IQ': 'Iraq',
};

const REVERSE_NAME_MAP = Object.entries(NAME_MAP).reduce((acc, [code, name]) => {
  if (!acc[name]) acc[name] = code;
  return acc;
}, {});

// Register country aliases
REVERSE_NAME_MAP['United States'] = 'US';
REVERSE_NAME_MAP['United States of America'] = 'US';
REVERSE_NAME_MAP['USA'] = 'US';
REVERSE_NAME_MAP['South Korea'] = 'KR';
REVERSE_NAME_MAP['Korea'] = 'KR';
REVERSE_NAME_MAP['Russian Federation'] = 'RU';
REVERSE_NAME_MAP['Russia'] = 'RU';
REVERSE_NAME_MAP['Viet Nam'] = 'VN';
REVERSE_NAME_MAP['Vietnam'] = 'VN';
REVERSE_NAME_MAP['United Arab Emirates'] = 'AE';
REVERSE_NAME_MAP['UAE'] = 'AE';
REVERSE_NAME_MAP['United Kingdom'] = 'GB';
REVERSE_NAME_MAP['UK'] = 'GB';

const INTENSITY_COLORS = {
  PEAK: '#EA580C',
  HIGH: '#F97316',
  MEDIUM: '#FB923C',
  LOW: '#FDBA74'
};

const getIntensityColor = (intensity) => {
  if (typeof intensity === 'number') {
    if (intensity > 80) return '#EA580C';
    if (intensity > 60) return '#F97316';
    if (intensity > 40) return '#FB923C';
    return '#FDBA74';
  }
  return INTENSITY_COLORS[String(intensity)?.toUpperCase()] || '#6B7280';
};

export default function GlobalHeatMapSection({
  selectedCountryCode = '',
  onCountryChange,
}) {
  const { t } = useTranslation();
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allZones, setAllZones] = useState({ regions: [], countries: [] });
  const { projectId, filters, refreshTrigger, refreshData } = useDashboardContext();

  // Load all system zones/countries for complete dropdown selection
  useEffect(() => {
    let isMounted = true;
    apiClient.get('/analytics/zones')
      .then(res => {
        if (!isMounted) return;
        const data = res?.data?.data || res?.data || { regions: [], countries: [] };
        setAllZones(data);
      })
      .catch(err => console.error('Failed to fetch zones for heatmap:', err));
    return () => { isMounted = false; };
  }, []);

  const queryParams = mapFiltersToQueryParams(filters);
  const regionalQueryParams = useMemo(() => ({
    ...queryParams,
    country: selectedCountryCode
  }), [queryParams, selectedCountryCode]);

  const { data: mapData, isLoading: isGeoLoading, error: geoError } = useGeoDistribution(projectId, queryParams, refreshTrigger);
  const { data: regionalData, isFetching: isRegionalLoading } = useGeoDistribution(
    projectId,
    regionalQueryParams,
    refreshTrigger,
    { enabled: Boolean(selectedCountryCode) }
  );

  // When selected country code is active, regional data is passed via props 'data'
  const isRegionMode = Boolean(selectedCountryCode);

  // Sync selected country code when filters.zone changes
  useEffect(() => {
    if (!filters.zone || filters.zone === 'Global Distribution') {
      onCountryChange('');
      return;
    }

    const normalized = String(filters.zone).trim();
    let foundCode = REVERSE_NAME_MAP[normalized];

    if (!foundCode && Array.isArray(allZones?.countries)) {
      const match = allZones.countries.find(
        c => c.name.toLowerCase() === normalized.toLowerCase() || c.code.toLowerCase() === normalized.toLowerCase()
      );
      if (match) foundCode = match.code;
    }

    if (!foundCode && normalized.length === 2) {
      foundCode = normalized.toUpperCase();
    }

    if (foundCode) {
      onCountryChange(foundCode);
    } else {
      // If zone is a Region (e.g. 'Western Europe'), clear specific country so regional view is shown
      onCountryChange('');
    }
  }, [filters.zone, allZones]);

  // Parse global distribution list
  const heatMapData = useMemo(() => {
    if (!mapData) return {};
    return mapData.reduce((acc, item) => {
      const code = item.countryCode || item.country;
      const name = NAME_MAP[code] || item.countryName || code;
      const dataObj = {
        intensity: item.intensity,
        count: item.count,
        intensityLabel: item.intensityLabel
      };
      if (name) acc[name] = dataObj;
      if (code) acc[code] = dataObj;
      return acc;
    }, {});
  }, [mapData]);

  // Extract comprehensive country options for dropdown selector
  const availableCountries = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (Array.isArray(allZones?.countries)) {
      for (const c of allZones.countries) {
        if (!seen.has(c.code)) {
          seen.add(c.code);
          list.push({ code: c.code, name: c.name || NAME_MAP[c.code] || c.code });
        }
      }
    }

    if (Array.isArray(mapData)) {
      for (const item of mapData) {
        const code = item.countryCode || item.country;
        if (code && !seen.has(code)) {
          seen.add(code);
          list.push({ code, name: NAME_MAP[code] || item.countryName || code });
        }
      }
    }

    for (const [code, name] of Object.entries(NAME_MAP)) {
      if (!seen.has(code)) {
        seen.add(code);
        list.push({ code, name });
      }
    }

    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [allZones, mapData]);

  // Sync state with parent country code parameter
  useEffect(() => {
    if (selectedCountryCode) {
      const match = availableCountries.find(c => c.code === selectedCountryCode);
      const name = match?.name || NAME_MAP[selectedCountryCode] || selectedCountryCode;
      setSelectedCountryName(name);
      setSearchQuery(name);
    } else {
      setSelectedCountryName('');
      setSearchQuery('');
    }
  }, [selectedCountryCode, availableCountries]);

  const getFillColor = (geoName) => {
    const code = REVERSE_NAME_MAP[geoName];
    if (selectedCountryCode && (code === selectedCountryCode || geoName === selectedCountryName)) {
      return '#EA580C'; // Highlight selected country
    }
    const item = heatMapData[geoName] || (code && heatMapData[code]);
    if (!item?.intensity || !item?.count) return '#444F5D'; // Dark slate blue/gray for countries without data
    return getIntensityColor(item.intensity);
  };

  const handleCountryClick = (geo) => {
    const geoName = geo.properties.name;
    const alpha2 = REVERSE_NAME_MAP[geoName];
    if (!alpha2) return;

    if (selectedCountryCode === alpha2) {
      onCountryChange('');
    } else {
      onCountryChange(alpha2);
    }
  };

  const handleReset = () => {
    onCountryChange('');
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      onCountryChange('');
      return;
    }
    const match = availableCountries.find(
      c => c.code.toLowerCase() === query || c.name.toLowerCase().includes(query)
    );
    if (match) {
      onCountryChange(match.code);
    }
  };

  // Find max count for rendering progress track percentages
  const maxRegionCount = useMemo(() => {
    if (!isRegionMode || !Array.isArray(regionalData) || regionalData.length === 0) return 0;
    return Math.max(...regionalData.map(item => Number(item.count) || 0));
  }, [regionalData, isRegionMode]);

  if (isGeoLoading) {
    return (
      <div className="world-heatmap-container dashboard-card">
        <LoadingSkeleton height="500px" />
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="world-heatmap-container dashboard-card">
        <InlineErrorState 
          message={t('dashboard.mapError', 'Failed to load geographical map')}
          onRetry={refreshData}
        />
      </div>
    );
  }

  return (
    <div className="world-heatmap-container dashboard-card">
      <div className="world-heatmap-header">
        <div>
          <h2 className="world-heatmap-title">{t('dashboard.geoHeatMap', 'Geographical Heat Map')}</h2>
          <p className="world-heatmap-subtitle">
            {selectedCountryCode
              ? `${t('dashboard.viewingDetails', 'Viewing details')}: ${selectedCountryName}`
              : t('dashboard.geoHeatMapSub', 'Global research output intensity by jurisdiction')}
          </p>
        </div>
        <div className="world-heatmap-actions">
          <div className="country-search-wrapper">
            <FiSearch className="search-icon" onClick={handleSearchSubmit} />
            <input
              type="text"
              placeholder={t('dashboard.searchCountry', 'Search country...')}
              className="country-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            {searchQuery && (
              <button type="button" className="search-clear-btn" onClick={handleReset}>
                <FiX />
              </button>
            )}
          </div>

          <div className="country-select-wrapper">
            <select
              value={selectedCountryCode || ''}
              onChange={(e) => onCountryChange(e.target.value)}
              className="country-select-dropdown"
            >
              <option value="">{t('dashboard.allCountries', 'All Countries')}</option>
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="world-heatmap-content">
        <div className="map-wrapper" style={{ position: 'relative' }}>
          <ComposableMap
            projection="geoEqualEarth"
            className="react-simple-map"
            width={800}
            height={450}
            projectionConfig={{
              scale: 160,
              center: [0, 0]
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.name;
                  const alpha2 = REVERSE_NAME_MAP[geoName];
                  const isSelected = selectedCountryCode && alpha2 === selectedCountryCode;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFillColor(geoName)}
                      stroke="#2B333F"
                      strokeWidth={0.5}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: {
                          outline: 'none',
                          opacity: 1,
                          transition: 'opacity 0.2s ease, fill 0.2s ease'
                        },
                        hover: {
                          fill: isSelected ? '#EA580C' : '#F97316',
                          outline: 'none',
                          cursor: 'pointer',
                          opacity: 1
                        },
                        pressed: {
                          fill: '#EA580C',
                          outline: 'none'
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>

          {/* Top-Right Info Card Overlay */}
          {selectedCountryCode && selectedCountryName && (
            <div className="country-detail-card font-sans">
              <div className="country-detail-header">
                <div className="country-detail-flag-code">{selectedCountryCode}</div>
                <button
                  className="country-detail-close"
                  onClick={handleReset}
                  aria-label="Close details"
                >
                  <FiX />
                </button>
              </div>
              <div className="country-detail-name">{selectedCountryName}</div>
              <div className="country-detail-divider"></div>

              {(isRegionalLoading && selectedCountryCode !== '') ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <div className="province-spinner"></div>
                  <span className="text-xs text-neutral-400">{t('dashboard.loadingRegionalDetails', 'Loading regional details...')}</span>
                </div>
              ) : (!regionalData || regionalData.length === 0) ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  {t('dashboard.noRegionalData', 'No regional data found for this country.')}
                </div>
              ) : (
                <div className="region-map-list-preview max-h-56 overflow-y-auto pr-1">
                  {regionalData.map((item, index) => {
                    const color = getIntensityColor(item.intensityLabel || item.intensity);
                    const percentage = maxRegionCount
                      ? Math.max(6, ((Number(item.count) || 0) / maxRegionCount) * 100)
                      : 6;

                    return (
                      <div className="region-map-mini-row" key={item.regionCode || index}>
                        <div className="region-map-mini-label">
                          <span title={item.regionName || item.regionCode}>
                            {item.regionName || item.regionCode || 'Unknown'}
                          </span>
                          <small>{item.count?.toLocaleString() || 0}</small>
                        </div>
                        <div className="region-map-mini-track">
                          <div
                            className="region-map-mini-fill"
                            style={{
                              width: `${percentage}%`,
                              background: color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="country-detail-hint">Click close or click country to zoom out</p>
            </div>
          )}

          <div className="activity-density-legend">
            <span className="legend-title">ACTIVITY DENSITY</span>
            <div className="legend-gradient">
              <div className="gradient-step" style={{ background: '#FDBA74' }}></div>
              <div className="gradient-step" style={{ background: '#FB923C' }}></div>
              <div className="gradient-step" style={{ background: '#F97316' }}></div>
              <div className="gradient-step" style={{ background: '#EA580C' }}></div>
            </div>
            <div className="legend-labels">
              <span>LOW</span>
              <span>PEAK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
