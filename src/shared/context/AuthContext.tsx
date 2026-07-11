import { createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { UserRole } from '@/shared/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    email: string;
    role: UserRole;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <AuthContext.Provider value={{ isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
