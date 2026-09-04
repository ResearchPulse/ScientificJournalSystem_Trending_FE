import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiFilter, FiCheck, FiChevronDown, FiX } from 'react-icons/fi';
import { BiSortAlt2 } from 'react-icons/bi';
import { coreApiClient } from '../../../shared/api/axios';
import ErrorStateSection from '../../../shared/components/common/ErrorStateSection';
import '../styles/ProjectsPage.css';

const mapProjectFromApi = (project) => {
  const projectId = project.project_id ?? project.id;
  const title = project.title || project.project_name || 'Untitled Project';
  const subjectArea = project.subject_area || project.domain || 'GENERAL';
  const createdAt = project.created_at || project.updated_at || new Date().toISOString();

  return {
    id: String(projectId),
    title,
    status: project.status || 'ACTIVE',
    domain: String(subjectArea).toUpperCase(),
    tags: [
      { key: 'journalsCount', value: project.journal_count ?? 0 },
      { key: 'keywordsCount', value: project.keyword_count ?? 0 },
      { key: 'articlesCount', value: project.article_count ?? 0 },
    ],
    creator: {
      name: 'ResearchPulse',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=F97316&color=fff`,
    },
    modifiedAt: createdAt,
  };
};

export default function ProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST'); // NEWEST, OLDEST, A-Z
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modal State for New Project
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    domain: 'ARTIFICIAL INTELLIGENCE',
    tagsStr: '',
  });

  const domains = ['ALL', 'ARTIFICIAL INTELLIGENCE', 'QUANTUM PHYSICS', 'BIOINFORMATICS', 'ENVIRONMENTAL SCIENCE', 'COMPUTER NETWORKS'];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coreApiClient.get('/api/v1/projects');
      const items = Array.isArray(response?.data)
        ? response.data
        : (Array.isArray(response?.data?.data) ? response.data.data : []);

      const mapped = items.map(mapProjectFromApi);
      setProjects(mapped);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}/dashboard`);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    const tags = newProject.tagsStr
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    const createdProject = {
      id: newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: newProject.title,
      domain: newProject.domain,
      tags: tags.length > 0 ? tags : ['GENERAL'],
      creator: {
        name: 'Julian Vane',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      },
      modifiedAt: new Date().toISOString().split('T')[0],
    };

    setProjects([createdProject, ...projects]);
    setShowCreateModal(false);
    setNewProject({ title: '', domain: 'ARTIFICIAL INTELLIGENCE', tagsStr: '' });
  };

  // Filter & Sort logic
  const filteredProjects = projects.filter(project => {
    if (selectedDomain === 'ALL') return true;
    return project.domain === selectedDomain;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOrder === 'NEWEST') {
      return new Date(b.modifiedAt) - new Date(a.modifiedAt);
    }
    if (sortOrder === 'OLDEST') {
      return new Date(a.modifiedAt) - new Date(b.modifiedAt);
    }
    if (sortOrder === 'A-Z') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div className="projects-page-container">
      <div className="projects-header-section">
        <div className="projects-title-block">
          <h1 className="projects-page-title">{t('dashboard.title')}</h1>
          <p className="projects-page-subtitle">{t('dashboard.subtitle')}</p>
        </div>

        <div className="projects-actions-block">
          {/* Filter Dropdown */}
          <div className="dropdown-wrapper">
            <button
              className={`projects-action-btn ${selectedDomain !== 'ALL' ? 'active' : ''}`}
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
            >
              <FiFilter className="btn-icon" />
              <span>{t('dashboard.filter')}: {selectedDomain === 'ALL' ? t('dashboard.all') : selectedDomain}</span>
              <FiChevronDown className="chevron-icon" />
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu">
                {domains.map(d => (
                  <button
                    key={d}
                    className={`dropdown-item ${selectedDomain === d ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDomain(d);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <span>{d === 'ALL' ? t('dashboard.all') : d}</span>
                    {selectedDomain === d && <FiCheck className="check-icon" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="dropdown-wrapper">
            <button
              className="projects-action-btn"
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
            >
              <BiSortAlt2 className="btn-icon" />
              <span>{t('dashboard.sortBy')}: {sortOrder === 'NEWEST' ? t('dashboard.newest') : sortOrder === 'OLDEST' ? t('dashboard.oldest') : t('dashboard.az')}</span>
              <FiChevronDown className="chevron-icon" />
            </button>
            {showSortDropdown && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${sortOrder === 'NEWEST' ? 'selected' : ''}`}
                  onClick={() => {
                    setSortOrder('NEWEST');
                    setShowSortDropdown(false);
                  }}
                >
                  <span>{t('dashboard.newest')}</span>
                  {sortOrder === 'NEWEST' && <FiCheck className="check-icon" />}
                </button>
                <button
                  className={`dropdown-item ${sortOrder === 'OLDEST' ? 'selected' : ''}`}
                  onClick={() => {
                    setSortOrder('OLDEST');
                    setShowSortDropdown(false);
                  }}
                >
                  <span>{t('dashboard.oldest')}</span>
                  {sortOrder === 'OLDEST' && <FiCheck className="check-icon" />}
                </button>
                <button
                  className={`dropdown-item ${sortOrder === 'A-Z' ? 'selected' : ''}`}
                  onClick={() => {
                    setSortOrder('A-Z');
                    setShowSortDropdown(false);
                  }}
                >
                  <span>{t('dashboard.az')}</span>
                  {sortOrder === 'A-Z' && <FiCheck className="check-icon" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
            <div className="update-icon spin" style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-orange)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}></div>
            <div>{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorStateSection
              title={t('common.error')}
              message={error}
              onRetry={fetchProjects}
              minHeight={300}
            />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', color: 'var(--color-neutral-500)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)' }}>
            <h3>{t('dashboard.noProjects')}</h3>
          </div>
        ) : (
          sortedProjects.map(project => {
            const isInactive = project.status === 'INACTIVE';
            return (
              <div
                key={project.id}
                className={`project-card real-project-card ${isInactive ? 'inactive-project-card' : ''}`}
                onClick={() => {
                  if (isInactive) return;
                  handleProjectClick(project.id);
                }}
                title={isInactive ? t('dashboard.inactiveTooltip') : undefined}
                aria-disabled={isInactive}
                tabIndex={isInactive ? -1 : 0}
              >
                <div className="project-card-header">
                  <span className="project-domain-tag">{project.domain}</span>
                  {isInactive && (
                    <span className="inactive-badge">🔒 {t('dashboard.inactive')}</span>
                  )}
                </div>

                <h3 className="project-title" title={project.title}>
                  {project.title}
                </h3>

                <div className="project-tags-list">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="project-sub-tag">
                      {typeof tag === 'object' ? `${t(`dashboard.${tag.key}`)}: ${tag.value}` : tag}
                    </span>
                  ))}
                </div>

                <div className="project-card-footer">
                  <div className="project-creator">
                    <img
                      src={project.creator.avatar}
                      alt={project.creator.name}
                      className="creator-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.creator.name)}&background=F97316&color=fff`;
                      }}
                    />
                    <span className="creator-name">{project.creator.name}</span>
                  </div>
                  <span className="project-date">
                    {formatDate(project.modifiedAt)}
                  </span>
                </div>

                {isInactive && (
                  <div className="inactive-overlay">
                    <div className="inactive-overlay-content">
                      <span className="inactive-overlay-divider">────────────────────────</span>
                      <p>{t('dashboard.inactiveMessage1')}<br />{t('dashboard.inactiveMessage2')}</p>
                      <span className="inactive-overlay-divider">────────────────────────</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t('dashboard.createProject')}</h2>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="proj-title">{t('dashboard.projectName')} *</label>
                <input
                  id="proj-title"
                  type="text"
                  className="form-input"
                  value={newProject.title}
                  onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder={t('dashboard.projectName')}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-domain">{t('dashboard.subjectArea')}</label>
                <select
                  id="proj-domain"
                  className="form-select"
                  value={newProject.domain}
                  onChange={e => setNewProject({ ...newProject, domain: e.target.value })}
                >
                  {domains.filter(d => d !== 'ALL').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proj-tags">{t('dashboard.keywords')}</label>
                <input
                  id="proj-tags"
                  type="text"
                  className="form-input"
                  value={newProject.tagsStr}
                  onChange={e => setNewProject({ ...newProject, tagsStr: e.target.value })}
                  placeholder="DEEP LEARNING, GNN, LSTM..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setShowCreateModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="modal-btn btn-submit">
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
