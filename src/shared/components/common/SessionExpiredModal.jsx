import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLock, FiLogIn } from 'react-icons/fi';
import { useAuthStore } from '../../store/useAuthStore';
import './SessionExpiredModal.css';

export default function SessionExpiredModal() {
  const { t, i18n } = useTranslation();
  const visible = useAuthStore((state) => state.sessionExpiredModalVisible);
  const setSessionExpiredModalVisible = useAuthStore((state) => state.setSessionExpiredModalVisible);
  const logout = useAuthStore((state) => state.logout);

  if (!visible) return null;

  const handleLoginRedirect = () => {
    setSessionExpiredModalVisible(false);
    logout();

    const currentLang = i18n.language || 'vi';
    const baseUrl = import.meta.env.VITE_PAGE_BASE_URL || 'http://localhost:5173';
    const sanitizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const currentUrl = window.location.href;

    // Navigate to Core Login with return URL
    window.location.href = `${sanitizedBaseUrl}/${currentLang}/login?redirect=${encodeURIComponent(currentUrl)}`;
  };

  const handleDismiss = () => {
    setSessionExpiredModalVisible(false);
    logout();
  };

  return (
    <div className="session-modal-overlay" role="dialog" aria-modal="true">
      <div className="session-modal-container">
        <div className="session-modal-icon-wrapper">
          <FiLock />
        </div>

        <h3 className="session-modal-title">
          {t('auth.sessionExpiredTitle', 'Phiên đăng nhập đã hết hạn')}
        </h3>

        <p className="session-modal-desc">
          {t(
            'auth.sessionExpiredMessage',
            'Phiên làm việc của bạn đã hết hạn để đảm bảo an toàn bảo mật. Vui lòng đăng nhập lại để tiếp tục sử dụng đầy đủ các tính năng.'
          )}
        </p>

        <div className="session-modal-actions">
          <button
            type="button"
            className="session-btn-login"
            onClick={handleLoginRedirect}
          >
            <FiLogIn size={16} />
            <span>{t('auth.loginAgain', 'Đăng nhập lại')}</span>
          </button>

          <button
            type="button"
            className="session-btn-guest"
            onClick={handleDismiss}
          >
            {t('auth.continueAsGuest', 'Tiếp tục với vai trò Khách')}
          </button>
        </div>
      </div>
    </div>
  );
}
