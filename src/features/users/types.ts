import type { UserRole } from '@/shared/types';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  avatar?: string;
  lastLoginAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
}
