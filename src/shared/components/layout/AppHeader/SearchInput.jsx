import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiFileText,
  FiHash,
  FiLoader,
  FiSearch,
  FiShare2,
  FiTag,
  FiUser,
} from 'react-icons/fi';
import './Header.css';

const TYPE_FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'article', label: 'Bài báo' },
  { value: 'journal', label: 'Tạp chí' },
  { value: 'author', label: 'Tác giả' },
  { value: 'institution', label: 'Tổ chức' },
  { value: 'keyword', label: 'Từ khóa' },
  { value: 'topic', label: 'Chủ đề' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Liên quan nhất' },
  { value: 'year_desc', label: 'Năm mới nhất' },
  { value: 'citations_desc', label: 'Trích dẫn cao' },
  { value: 'name_asc', label: 'Tên A-Z' },
];

const ICON_MAP = {
  article: FiFileText,
  'file-text': FiFileText,
  journal: FiBookOpen,
  'book-open': FiBookOpen,
  author: FiUser,
  user: FiUser,
  institution: FiBriefcase,
  'building-2': FiBriefcase,
  keyword: FiTag,
  tag: FiTag,
  topic: FiShare2,
  network: FiShare2,
};

const getItemIcon = (item) => ICON_MAP[item?.typeIcon] || ICON_MAP[item?.type] || FiHash;

const getBadgeVariant = (variant) => {
  if (!variant) return 'neutral';
  return String(variant).toLowerCase().replace(/[^a-z0-9_-]/g, '');
};

const formatCount = (value) => {
  const numericValue = Number(value || 0);
  if (numericValue >= 1000) return `${(numericValue / 1000).toFixed(numericValue >= 10000 ? 0 : 1)}K`;
  return String(numericValue);
};

const formatStatValue = (stat) => {
  if (stat?.displayValue) return stat.displayValue;
  if (stat?.value === 0 || stat?.value) return `${stat.value}${stat.suffix ? ` ${stat.suffix}` : ''}`;
  return '-';
};

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Tìm bài báo, tạp chí, tác giả...',
  results = [],
  counts = {},
  total = 0,
  page = 1,
  totalPages = 0,
  activeType = 'all',
  sort = 'relevance',
  isLoading = false,
  isStreaming = false,
  disabled = false,
  error = null,
  onTypeChange,
  onSortChange,
  onPageChange,
  onResultSelect,
}) => {
  const { i18n } = useTranslation();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const trimmedValue = value.trim();
  const shouldShowDropdown = !disabled && isOpen && trimmedValue.length >= 2;
  const hasResults = results.length > 0;
  const countTotal = useMemo(() => {
    if (total) return total;
    return Object.values(counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  }, [counts, total]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const getTypeCount = (type) => {
    if (type === 'all') return countTotal;
    return counts?.[type] ?? 0;
  };

  const handleChange = (event) => {
    if (disabled) return;
    setIsOpen(true);
    onChange(event);
  };

  const handleResultClick = (item) => {
    if (!item?.detailPath) return;
    onResultSelect?.(item);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getFullDetailUrl = (detailPath) => {
    if (!detailPath) return '#';
    if (detailPath.startsWith('/')) {
      const lang = i18n.language || 'vi';
      const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || '';
      const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${sanitizedBaseUrl}/${lang}${detailPath}`;
    }
    return detailPath;
  };

  return (
    <div className="header-search-container" ref={containerRef}>
      <FiSearch className="header-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="header-search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={shouldShowDropdown}
        aria-haspopup="listbox"
        aria-controls="header-search-results"
      />
      {shouldShowDropdown && (
        <div className="header-search-dropdown" id="header-search-results">
          <div className="header-search-toolbar">
            <div className="header-search-tabs" role="tablist" aria-label="Loại kết quả tìm kiếm">
              {TYPE_FILTERS.map((filter) => {
                const isActive = activeType === filter.value;
                const filterCount = getTypeCount(filter.value);
                return (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`header-search-tab ${isActive ? 'active' : ''}`}
                    onClick={() => onTypeChange?.(filter.value)}
                  >
                    <span>{filter.label}</span>
                    <span className="header-search-tab-count">{formatCount(filterCount)}</span>
                  </button>
                );
              })}
            </div>
            <label className="header-search-sort-label">
              Sắp xếp
              <span className="header-search-select-wrap">
                <select
                  className="header-search-sort"
                  value={sort}
                  onChange={(e) => onSortChange?.(e.target.value)}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="header-search-select-icon" aria-hidden="true" />
              </span>
            </label>
          </div>
          <div className="header-search-status-row">
            <span className="header-search-results-summary" aria-live="polite">
              {isLoading && !hasResults
                ? 'Đang tìm kiếm...'
                : hasResults
                  ? `${formatCount(countTotal)} kết quả cho "${trimmedValue}"`
                  : `Tìm kiếm "${trimmedValue}"`}
            </span>
            {isStreaming && (
              <span className="header-search-streaming">
                <FiLoader aria-hidden="true" />
                Stream search
              </span>
            )}
          </div>

          <div className="header-search-results">
            {isLoading && !hasResults ? (
              <div className="header-search-state">
                <FiLoader className="header-search-state-icon spinning" aria-hidden="true" />
                <span>Đang tìm kiếm...</span>
              </div>
            ) : error ? (
              <div className="header-search-state">
                <span>Không thể tải kết quả tìm kiếm.</span>
              </div>
            ) : hasResults ? (
              results.map((item) => {
                const ItemIcon = getItemIcon(item);
                const summary = item.snippet || item.description;
                const badges = (item.badges || []).slice(0, 3);
                const stats = (item.stats || []).slice(0, 3);

                return (
                  <a
                    key={`${item.type}-${item.id}`}
                    href={getFullDetailUrl(item.detailPath)}
                    className="header-search-result-card"
                    onClick={(event) => {
                      event.preventDefault();
                      handleResultClick(item);
                    }}
                    aria-disabled={!item.detailPath}
                  >
                    <div className="header-search-result-media" aria-hidden="true">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="header-search-result-image" />
                      ) : (
                        <ItemIcon />
                      )}
                    </div>

                    <div className="header-search-result-body">
                      <div className="header-search-result-meta">
                        <span>{item.typeLabel}</span>
                        {item.rank ? <span>#{item.rank}</span> : null}
                        {item.publicationYear ? <span>{item.publicationYear}</span> : null}
                        {item.citationCount ? <span>{formatCount(item.citationCount)} citations</span> : null}
                      </div>

                      <div className="header-search-result-title">{item.title}</div>

                      {(badges.length > 0 || summary) && (
                        <div className="header-search-result-tags">
                          {badges.map((badge) => (
                            <span
                              key={`${badge.label}-${badge.value}`}
                              className={`header-search-badge header-search-badge--${getBadgeVariant(badge.variant)}`}
                            >
                              {badge.value || badge.label}
                            </span>
                          ))}
                          {!badges.length && summary ? (
                            <span className="header-search-badge">{summary}</span>
                          ) : null}
                        </div>
                      )}

                      {stats.length > 0 ? (
                        <div className="header-search-result-metadata">
                          {stats.map((stat) => (
                            <span key={`${stat.label}-${stat.value}`} className="header-search-metadata-item">
                              <strong>{formatStatValue(stat)}</strong>
                              <span>{stat.label}</span>
                            </span>
                          ))}
                        </div>
                      ) : item.subtitle ? (
                        <div className="header-search-result-metadata">
                          <span className="header-search-metadata-item">{item.subtitle}</span>
                        </div>
                      ) : null}
                    </div>

                    {item.detailPath ? (
                      <span className="header-search-result-action" aria-label="Mở chi tiết">
                        <FiExternalLink aria-hidden="true" />
                      </span>
                    ) : null}
                  </a>
                );
              })
            ) : (
              <div className="header-search-state">
                <span>Không tìm thấy kết quả phù hợp.</span>
                <small>Thử đổi từ khóa hoặc bỏ bớt bộ lọc.</small>
              </div>
            )}
          </div>

          <div className="header-search-pagination">
            <span>
              Trang {totalPages ? page : 0}/{totalPages || 0}
            </span>
            <div className="header-search-page-actions">
              <button
                type="button"
                className="header-search-page-button"
                onClick={() => onPageChange?.(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                aria-label="Trang trước"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                className="header-search-page-button"
                onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
                disabled={!totalPages || page >= totalPages || isLoading}
                aria-label="Trang sau"
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
