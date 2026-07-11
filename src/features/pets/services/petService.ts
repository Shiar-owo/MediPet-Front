import api from '@/shared/lib/api';
import type { ApiResponse, SearchParams } from '@/shared/types';
import type { PetRequest, PetResponse, PhotoUploadResponse, UpdatePetRequest } from '../types';

export const petService = {
  getAll: async (params?: SearchParams): Promise<ApiResponse<import('@/shared/types').PageResponse<PetResponse>>> => {
    const response = await api.get('/pets', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<PetResponse>> => {
    const response = await api.get(`/pets/${id}`);
    return response.data;
  },

  getByMicrochip: async (microchipId: string): Promise<ApiResponse<PetResponse>> => {
    const response = await api.get(`/pets/microchip/${microchipId}`);
    return response.data;
  },

  getByClientId: async (
    clientId: string,
    params?: SearchParams
  ): Promise<ApiResponse<import('@/shared/types').PageResponse<PetResponse>>> => {
    const response = await api.get(`/pets/client/${clientId}`, { params });
    return response.data;
  },

  create: async (data: PetRequest): Promise<ApiResponse<PetResponse>> => {
    const response = await api.post('/pets', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePetRequest): Promise<ApiResponse<PetResponse>> => {
    const response = await api.put(`/pets/${id}`, data);
    return response.data;
  },

  uploadPhoto: async (id: string, file: File): Promise<ApiResponse<PhotoUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/pets/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
