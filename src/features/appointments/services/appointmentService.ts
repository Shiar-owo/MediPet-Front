import api from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types';
import type {
  AppointmentRequest,
  AppointmentResponse,
  AppointmentSearchParams,
  CancelAppointmentRequest,
  UpdateAppointmentRequest,
} from '../types';

export const appointmentService = {
  getAll: async (
    params?: AppointmentSearchParams
  ): Promise<ApiResponse<import('@/shared/types').PageResponse<AppointmentResponse>>> => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<AppointmentResponse>> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  getByVeterinarianId: async (
    vetId: string,
    params?: AppointmentSearchParams
  ): Promise<ApiResponse<import('@/shared/types').PageResponse<AppointmentResponse>>> => {
    const response = await api.get(`/appointments/veterinarian/${vetId}`, { params });
    return response.data;
  },

  getByPetId: async (
    petId: string,
    params?: AppointmentSearchParams
  ): Promise<ApiResponse<import('@/shared/types').PageResponse<AppointmentResponse>>> => {
    const response = await api.get(`/appointments/pet/${petId}`, { params });
    return response.data;
  },

  getByClientId: async (
    clientId: string,
    params?: AppointmentSearchParams
  ): Promise<ApiResponse<import('@/shared/types').PageResponse<AppointmentResponse>>> => {
    const response = await api.get(`/appointments/client/${clientId}`, { params });
    return response.data;
  },

  create: async (data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateAppointmentRequest
  ): Promise<ApiResponse<AppointmentResponse>> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  cancel: async (
    id: string,
    data?: CancelAppointmentRequest
  ): Promise<ApiResponse<AppointmentResponse>> => {
    const response = await api.patch(`/appointments/${id}/cancel`, data);
    return response.data;
  },

  complete: async (id: string): Promise<ApiResponse<AppointmentResponse>> => {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },
};
