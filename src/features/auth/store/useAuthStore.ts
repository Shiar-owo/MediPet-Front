import { create } from 'zustand';
import type { UserRole } from '@/shared/types';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: UserRole;
  } | null;
  login: (email: string, role: UserRole, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

function getInitialAuthState() {
  const accessToken = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  if (accessToken && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { isAuthenticated: true, user };
    } catch {
      localStorage.removeItem('user');
    }
  }
  return { isAuthenticated: false, user: null };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuthState(),

  login: (email, role, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify({ email, role }));
    set({
      isAuthenticated: true,
      user: { email, role },
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      isAuthenticated: false,
      user: null,
    });
  },
}));
