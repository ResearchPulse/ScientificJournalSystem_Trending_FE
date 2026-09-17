import { coreApiClient } from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Checks the user's active session against Core BE using HTTP-only cookies.
 * Synchronizes user data into useAuthStore.
 */
export const checkAuthSession = async () => {
  const store = useAuthStore.getState();
  store.setLoading(true);

  try {
    const response = await coreApiClient.get('/api/v1/users/me');
    const user = response?.data || response;
    
    if (user && (user.user_id || user.id || user.email)) {
      useAuthStore.getState().loginSuccess(user);
      return user;
    }

    useAuthStore.getState().logout();
    return null;
  } catch (error) {
    // If not authenticated or expired, clean up silently without modal on initial load
    useAuthStore.getState().logout();
    return null;
  } finally {
    useAuthStore.getState().setLoading(false);
  }
};

/**
 * Logs out the session by clearing HTTP-only cookies on Core BE
 * and cleaning up client-side state.
 */
export const logoutSession = async () => {
  try {
    await coreApiClient.post('/api/v1/auth/logout');
  } catch (err) {
    console.warn('[AUTH] Error during logout API call:', err?.message || err);
  } finally {
    useAuthStore.getState().logout();
  }
};
