import api from '@/shared/lib/api';
import type { ApiResponse, SearchParams } from '@/shared/types';
import type { ClientRequest, ClientResponse, UpdateClientRequest } from '../types';

export const clientService = {
  getAll: async (params?: SearchParams): Promise<ApiResponse<import('@/shared/types').PageResponse<ClientResponse>>> => {
    const response = await api.get('/clients', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<ClientResponse>> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  getByDni: async (dni: string): Promise<ApiResponse<ClientResponse>> => {
    const response = await api.get(`/clients/dni/${dni}`);
    return response.data;
  },

  create: async (data: ClientRequest): Promise<ApiResponse<ClientResponse>> => {
    const response = await api.post('/clients', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClientRequest): Promise<ApiResponse<ClientResponse>> => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },
};
