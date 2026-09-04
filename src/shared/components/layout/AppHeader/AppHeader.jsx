import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBell, FiHelpCircle } from 'react-icons/fi';
import SearchInput from './SearchInput';
import IconButton from './IconButton';

import { useDashboardSearchQuery } from '../../../hooks/useDashboardSearch';
import LanguageSelector from '../../common/LanguageSelector';
import './Header.css';

/**
 * AppHeader component
 * Orchestrates search input on the left and actions + user profile on the right.
 * Supports sticky header configuration.
 */
const AppHeader = ({
  sticky = true,
  onSearch,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchSort, setSearchSort] = useState('relevance');
  const [searchPage, setSearchPage] = useState(1);
  const pathProjectId = location.pathname.match(/\/project\/([^/]+)/)?.[1];
  const rawProjectId = id || pathProjectId;
  const projectId = rawProjectId && rawProjectId !== 'default-id' ? rawProjectId : undefined;
  const canSearchInProject = Boolean(projectId);
  const {
    data: searchResults,
    searchData,
    counts: searchCounts,
    total: searchTotal,
    totalPages: searchTotalPages,
    isLoading: isSearchLoading,
    isStreaming: isSearchStreaming,
    error: searchError,
  } = useDashboardSearchQuery(searchValue, searchType, {
    projectId,
    page: searchPage,
    limit: 8,
    sort: searchSort,
    enabled: canSearchInProject,
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearchPage(1);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    setSearchPage(1);
  };

  const handleSortChange = (sort) => {
    setSearchSort(sort);
    setSearchPage(1);
  };

  const handleResultSelect = (item) => {
    if (item?.detailPath) {
      if (item.detailPath.startsWith('/')) {
        const lang = i18n.language || 'vi';
        const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || '';
        const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        window.open(`${sanitizedBaseUrl}/${lang}${item.detailPath}`, '_blank');
      } else {
        navigate(item.detailPath);
      }
    }
  };

  return (
    <header className={`dashboard-header ${sticky ? 'sticky' : ''}`}>
      <div className="header-left">
        <SearchInput 
          value={canSearchInProject ? searchValue : ''} 
          onChange={handleSearchChange} 
          placeholder={canSearchInProject ? t('header.searchPlaceholder') : t('header.selectProject')}
          disabled={!canSearchInProject}
          results={searchResults}
          counts={searchCounts}
          total={searchTotal}
          page={searchData.page}
          totalPages={searchTotalPages}
          activeType={searchType}
          sort={searchSort}
          isLoading={isSearchLoading}
          isStreaming={isSearchStreaming}
          error={searchError}
          onTypeChange={handleTypeChange}
          onSortChange={handleSortChange}
          onPageChange={setSearchPage}
          onResultSelect={handleResultSelect}
        />
      </div>
      <div className="header-right">
        <div className="header-actions">
          <IconButton 
            icon={FiBell} 
            onClick={() => console.log('notifications clicked')} 
            ariaLabel={t('header.notifications')} 
            badge={3}
          />
          <LanguageSelector />
          <IconButton 
            icon={FiHelpCircle} 
            onClick={() => console.log('help clicked')} 
            ariaLabel={t('header.help')} 
          />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
