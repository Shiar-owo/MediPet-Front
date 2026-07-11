import api from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types';
import type {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types';
import type { UserResponse } from '@/features/users/types';

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await api.post('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: RefreshTokenRequest): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout', data);
    return response.data;
  },
};
