import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaServer, 
  FaRedo, 
  FaHome, 
  FaArrowLeft, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaChevronDown, 
  FaChevronUp,
  FaWrench
} from 'react-icons/fa';
import LanguageSelector from '../shared/components/common/LanguageSelector';
import { checkBackendHealth } from '../shared/api/axios';
import './MaintenancePage.css';

export default function MaintenancePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const currentLang = lang || 'en';

  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState(null); // 'success' | 'failed' | null
  const [showDetails, setShowDetails] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date().toLocaleTimeString());

  // Lấy thông tin lỗi được lưu từ trước (nếu có)
  const [errorInfo, setErrorInfo] = useState(() => {
    try {
      const saved = sessionStorage.getItem('maintenance_error_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleRetry = async () => {
    if (isChecking) return;
    setIsChecking(true);
    setCheckStatus(null);

    try {
      const isHealthy = await checkBackendHealth();
      setLastCheckedTime(new Date().toLocaleTimeString());

      if (isHealthy) {
        setCheckStatus('success');
        // Xóa thông tin lỗi cũ
        sessionStorage.removeItem('maintenance_error_info');
        
        // Chờ 1.2s để người dùng thấy trạng thái thành công rồi chuyển hướng
        setTimeout(() => {
          const redirectBack = sessionStorage.getItem('maintenance_redirect_back');
          if (redirectBack && !redirectBack.includes('/maintenance')) {
            sessionStorage.removeItem('maintenance_redirect_back');
            navigate(redirectBack);
          } else {
            navigate(`/${currentLang}/projects`);
          }
        }, 1200);
      } else {
        setCheckStatus('failed');
      }
    } catch (err) {
      setCheckStatus('failed');
      setLastCheckedTime(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  };

  const handleGoHome = () => {
    navigate(`/${currentLang}/projects`);
  };

  return (
    <div className="maintenance-page-container">
      {/* Header Bar với Language Selector */}
      <header className="maintenance-topbar">
        <div className="maintenance-brand">
          <span className="brand-dot"></span>
          <span className="brand-name">ResearchPulse</span>
        </div>
        <div className="maintenance-topbar-actions">
          <LanguageSelector />
        </div>
      </header>

      {/* Main Card */}
      <main className="maintenance-card">
        {/* Status Badge */}
        <div className="maintenance-status-badge">
          <span className="status-indicator"></span>
          <span className="status-text">{t('maintenance.badge', 'Hệ thống bảo trì / Mất kết nối')}</span>
        </div>

        {/* Visual Illustration */}
        <div className="maintenance-visual">
          <div className="visual-circle-glow"></div>
          <div className="visual-icon-cluster">
            <div className="visual-server-card">
              <FaServer className="server-icon" />
              <div className="server-slots">
                <span className="slot active"></span>
                <span className="slot warning"></span>
                <span className="slot active"></span>
              </div>
            </div>
            <div className="visual-badge wrench-badge">
              <FaWrench className="wrench-icon" />
            </div>
            <div className="visual-badge alert-badge">
              <FaExclamationTriangle className="alert-icon" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="maintenance-title">
          {t('maintenance.title', 'Máy chủ tạm thời không thể kết nối')}
        </h1>
        <p className="maintenance-desc">
          {t('maintenance.description', 'Hiện tại hệ thống không thể kết nối tới máy chủ backend. Máy chủ có thể đang được bảo trì nâng cấp hoặc gặp sự cố đường truyền tạm thời.')}
        </p>

        {/* Possible causes list */}
        <div className="maintenance-reasons-box">
          <div className="reasons-header">
            {t('maintenance.possibleReasonsTitle', 'Nguyên nhân có thể xảy ra:')}
          </div>
          <ul className="reasons-list">
            <li>{t('maintenance.reason1', 'Máy chủ backend đang bảo trì hoặc đang khởi động lại.')}</li>
            <li>{t('maintenance.reason2', 'Đường truyền mạng nội bộ hoặc internet của bạn bị gián đoạn.')}</li>
            <li>{t('maintenance.reason3', 'Cổng kết nối máy chủ dịch vụ tạm thời không phản hồi.')}</li>
          </ul>
        </div>

        {/* Retry status toast/message */}
        {checkStatus === 'success' && (
          <div className="maintenance-feedback success">
            <FaCheckCircle className="feedback-icon" />
            <span>{t('maintenance.retrySuccess', 'Kết nối thành công! Đang chuyển hướng...')}</span>
          </div>
        )}
        {checkStatus === 'failed' && (
          <div className="maintenance-feedback error">
            <FaExclamationTriangle className="feedback-icon" />
            <span>{t('maintenance.retryFailed', 'Vẫn chưa thể kết nối tới máy chủ. Vui lòng thử lại sau.')}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="maintenance-actions">
          <button 
            type="button"
            className={`maint-btn btn-primary ${isChecking ? 'loading' : ''}`}
            onClick={handleRetry}
            disabled={isChecking}
          >
            <FaRedo className={`btn-icon ${isChecking ? 'spin' : ''}`} />
            <span>
              {isChecking 
                ? t('maintenance.retrying', 'Đang kiểm tra kết nối...') 
                : t('maintenance.retry', 'Thử kết nối lại')}
            </span>
          </button>

          <button 
            type="button"
            className="maint-btn btn-secondary"
            onClick={handleGoHome}
          >
            <FaHome className="btn-icon" />
            <span>{t('maintenance.goHome', 'Về Dashboard')}</span>
          </button>
        </div>

        {/* Auto retry note */}
        <p className="maintenance-footnote">
          {t('maintenance.autoRetryNote', 'Bạn có thể nhấn nút Thử kết nối lại bất cứ lúc nào hoặc tải lại trang sau ít phút.')}
        </p>

        {/* Technical Details Accordion */}
        <div className="maintenance-details-wrapper">
          <button 
            type="button"
            className="details-toggle-btn"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            <span>{showDetails ? t('maintenance.hideDetails', 'Ẩn chi tiết kỹ thuật') : t('maintenance.technicalDetails', 'Chi tiết kỹ thuật')}</span>
            {showDetails ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
          </button>

          {showDetails && (
            <div className="details-content">
              <div className="details-row">
                <span className="details-label">{t('maintenance.errorCode', 'Mã sự cố')}:</span>
                <span className="details-value badge-code">
                  {errorInfo?.code || errorInfo?.status || 'ERR_NETWORK / 503'}
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">{t('maintenance.lastChecked', 'Kiểm tra lần cuối lúc')}:</span>
                <span className="details-value">{lastCheckedTime}</span>
              </div>
              {errorInfo?.message && (
                <div className="details-row full">
                  <span className="details-label">Message:</span>
                  <span className="details-value code-box">{errorInfo.message}</span>
                </div>
              )}
              {errorInfo?.url && (
                <div className="details-row full">
                  <span className="details-label">Target URL:</span>
                  <span className="details-value code-box">{errorInfo.url}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="maintenance-footer">
        &copy; {new Date().getFullYear()} ResearchPulse - Scientific Journal Trend Tracking System
      </footer>
    </div>
  );
}
