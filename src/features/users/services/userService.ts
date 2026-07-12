import api from '@/shared/lib/api';
import type { ApiResponse, PaginationParams } from '@/shared/types';
import type { UpdateUserRequest, UserResponse } from '../types';

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role?: import('@/shared/types').UserRole;
}

export interface AvatarUploadResponse {
  avatar: string;
}

export const userService = {
  getAll: async (params?: PaginationParams): Promise<ApiResponse<import('@/shared/types').PageResponse<UserResponse>>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getVeterinarians: async (params?: PaginationParams): Promise<ApiResponse<import('@/shared/types').PageResponse<UserResponse>>> => {
    const response = await api.get('/users/veterinarians', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<UserResponse>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: RegisterUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  activate: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  },

  deactivate: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  },

  uploadAvatar: async (id: string, file: File): Promise<ApiResponse<AvatarUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
