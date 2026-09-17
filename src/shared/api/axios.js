import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CORE_BASE_URL = import.meta.env.VITE_API_CORE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Automatically sends cookies (access_token, refresh_token)
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const coreApiClient = axios.create({
  baseURL: CORE_BASE_URL,
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

/**
 * Shared response 401 interceptor handler for token refresh & session expiry
 */
const handleAuthError = (clientInstance, error) => {
  const originalRequest = error.config;
  if (!originalRequest) {
    return Promise.reject(error);
  }

  const url = originalRequest.url || '';
  const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/logout');

  // If 401 and not already retried, and not an auth management endpoint
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => clientInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          // Call refresh API on Core BE with credentials
          await axios.get(`${CORE_BASE_URL}/api/v1/auth/refresh`, {
            withCredentials: true,
          });

          // Session successfully refreshed
          useAuthStore.getState().loginSuccess(null);

          processQueue(null);
          resolve(clientInstance(originalRequest));
        } catch (refreshError) {
          processQueue(refreshError);

          // If user was previously authenticated, notify that session expired
          const wasAuthenticated = useAuthStore.getState().isAuthenticated;
          useAuthStore.getState().logout();

          if (wasAuthenticated) {
            useAuthStore.getState().setSessionExpiredModalVisible(true);
          }

          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      })();
    });
  }

  const message = error.response?.data?.message || error.response?.data?.error || error.message;
  return Promise.reject(new Error(message));
};

// Response interceptors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => handleAuthError(apiClient, error)
);

coreApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => handleAuthError(coreApiClient, error)
);

export default apiClient;

