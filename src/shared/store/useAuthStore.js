import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  isInitialized: false,
  sessionExpiredModalVisible: false,

  setSessionExpiredModalVisible: (visible) => set({ sessionExpiredModalVisible: Boolean(visible) }),

  loginSuccess: (user = null) => set((state) => ({ 
    isAuthenticated: true,
    user: user ?? state.user,
    sessionExpiredModalVisible: false,
    isLoading: false,
    isInitialized: true
  })),

  setUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => set({ 
    isAuthenticated: false,
    user: null,
    isLoading: false,
    isInitialized: true
  }),
}));
