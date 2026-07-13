import { create } from 'zustand';
import type { UserRole } from '@/shared/types';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: UserRole;
  } | null;
  login: (id: string, email: string, role: UserRole, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

function getInitialAuthState() {
  const accessToken = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  if (accessToken && userStr) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return { isAuthenticated: false, user: null };
      }
      const user = JSON.parse(userStr);
      return { isAuthenticated: true, user };
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }
  return { isAuthenticated: false, user: null };
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuthState(),

  login: (id, email, role, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify({ id, email, role }));
    set({
      isAuthenticated: true,
      user: { id, email, role },
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
