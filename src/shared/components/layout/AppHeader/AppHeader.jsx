import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBell, FiHelpCircle, FiLogIn } from 'react-icons/fi';
import SearchInput from './SearchInput';
import IconButton from './IconButton';
import UserProfile from './UserProfile';
import { useAuthStore } from '../../../store/useAuthStore';

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
  notificationCount,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

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

  const displayName = (user?.first_name || user?.last_name)
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : user?.fullName || user?.name || user?.username || 'Researcher';

  let role = 'Researcher';
  if (typeof user?.role === 'string') role = user.role;
  else if (user?.role?.name) role = user.role.name;
  else if (user?.role_name) role = user.role_name;

  let initials = 'U';
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    initials = parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const handleLoginClick = () => {
    const currentLang = i18n.language || 'vi';
    const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || 'http://localhost:5173';
    const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    window.location.href = `${sanitizedBaseUrl}/${currentLang}/login?redirect=${encodeURIComponent(window.location.href)}`;
  };

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
            badge={notificationCount}
          />
          <LanguageSelector />
          <IconButton 
            icon={FiHelpCircle} 
            onClick={() => console.log('help clicked')} 
            ariaLabel={t('header.help')} 
          />
        </div>

        {isAuthenticated && user ? (
          <UserProfile
            initials={initials}
            name={displayName}
            role={role}
            avatar={user?.avatar || null}
          />
        ) : (
          <button
            type="button"
            className="header-login-btn"
            onClick={handleLoginClick}
            title={t('auth.login', 'Đăng nhập')}
          >
            <FiLogIn size={15} />
            <span>{t('auth.login', 'Đăng nhập')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
