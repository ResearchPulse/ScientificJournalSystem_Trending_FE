import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This ensures cookies (access_token, refresh_token) are automatically sent
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

// No request interceptor needed to inject headers, browser handles HTTP-only cookies.

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        (async () => {
          try {
            // Call refresh API on Core BE (port 8000)
            const coreBaseUrl = import.meta.env.VITE_API_CORE_URL || 'http://localhost:8000';
            await axios.get(`${coreBaseUrl}/auth/refresh`, {
              withCredentials: true,
            });

            // If success, backend automatically sets new access_token cookie.
            useAuthStore.getState().loginSuccess(null);

            processQueue(null);
            resolve(apiClient(originalRequest));
          } catch (refreshError) {
            processQueue(error);
            useAuthStore.getState().logout();
            reject(error);
          } finally {
            isRefreshing = false;
          }
        })();
      });
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export const coreApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_CORE_URL || 'http://localhost:3000',
  withCredentials: true,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

coreApiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return coreApiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        (async () => {
          try {
            await axios.get(`${import.meta.env.VITE_API_CORE_URL || 'http://localhost:3000'}/api/v1/auth/refresh`, {
              withCredentials: true,
            });

            useAuthStore.getState().loginSuccess(null);

            processQueue(null);
            resolve(coreApiClient(originalRequest));
          } catch (refreshError) {
            processQueue(refreshError);
            useAuthStore.getState().logout();
            reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        })();
      });
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
