import React, { useEffect } from 'react';
import { checkAuthSession } from '../../shared/services/authService';
import SessionExpiredModal from '../../shared/components/common/SessionExpiredModal';

export default function AppProviders({ children }) {
  useEffect(() => {
    // Automatically verify and synchronize auth session cookie from Core BE
    checkAuthSession();
  }, []);

  return (
    <>
      {children}
      <SessionExpiredModal />
    </>
  );
}
