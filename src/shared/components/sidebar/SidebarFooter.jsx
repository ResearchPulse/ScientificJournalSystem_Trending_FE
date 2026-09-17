import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { sidebarConfig } from './sidebar.config';
import { useUserProfileQuery } from '../../hooks/useUserProfile';
import { useAuthStore } from '../../store/useAuthStore';
import { logoutSession } from '../../services/authService';
import { generateProfessionalReport } from '../../utils/pdfExport';
import './Sidebar.css';

// Renders the footer actions of the sidebar like Support and Sign Out
const SidebarFooter = ({ collapsed }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang, id } = useParams();
  const currentLang = lang || 'en';

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const { data: userProfile } = useUserProfileQuery();

  const activeUser = userProfile || authUser;
  const rawRole = activeUser?.displayRole || activeUser?.role || (isAuthenticated ? 'Researcher' : 'Guest');
  const translationKey = `role.${String(rawRole).toLowerCase().replace(/\s+/g, '')}`;

  const profile = {
    initials: activeUser?.initials || (isAuthenticated ? 'RP' : 'G'),
    name: activeUser?.displayName || (activeUser?.first_name ? `${activeUser.first_name} ${activeUser.last_name || ''}`.trim() : null) || (isAuthenticated ? 'Researcher' : t('common.guest', 'Guest')),
    role: t(translationKey, rawRole),
    avatar: activeUser?.avatar || null
  };

  // Handle footer action clicks dynamically based on action type
  const handleAction = (action) => {
    if (action === 'logout') {
      (async () => {
        try {
          await logoutSession();
        } catch {
          // ignore
        }
        queryClient.clear();
        const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || '/';
        window.location.assign(baseUrl);
      })();
    } else if (action === 'support') {
      navigate(`/${currentLang}/support`);
    } else if (action === 'export-pdf') {
      // Generate a structured, professional PDF report from the data cache
      (async () => {
        await generateProfessionalReport(queryClient, id);
      })();
    }
  };

  return (
    <div className="sidebar-footer">
      <div
        className={`sidebar-profile ${collapsed ? 'collapsed' : ''}`}
        title={`${profile.name} (${profile.role})`}
      >
        <div className="sidebar-profile-avatar">
          <span className="sidebar-profile-initials">{profile.initials}</span>
          {profile.avatar && (
            <img
              className="sidebar-profile-image"
              src={profile.avatar}
              alt={profile.name}
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        {!collapsed && (
          <div className="sidebar-profile-info">
            <span className="sidebar-profile-name">{profile.name}</span>
            <span className="sidebar-profile-role">{profile.role}</span>
          </div>
        )}
      </div>
      {sidebarConfig.footerItems.map((item, index) => {
        const IconComponent = item.icon;
        const translatedLabel = t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, '')}`, item.label);
        return (
          <button
            key={index}
            className={`sidebar-footer-item ${collapsed ? 'collapsed' : ''}`}
            onClick={() => handleAction(item.action)}
            title={collapsed ? translatedLabel : undefined}
            aria-label={translatedLabel}
          >
            <div className="sidebar-item-icon">
              <IconComponent />
            </div>
            {!collapsed && <span className="sidebar-item-label">{translatedLabel}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SidebarFooter;
