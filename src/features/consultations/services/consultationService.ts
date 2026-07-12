import api from '@/shared/lib/api';
import type { ApiResponse, PageResponse } from '@/shared/types';
import type { ConsultationResponse, CreateConsultationRequest } from '../types';

export const consultationService = {
  create: async (data: CreateConsultationRequest): Promise<ApiResponse<ConsultationResponse>> => {
    const response = await api.post('/consultations', data);
    return response.data;
  },

  getByAppointmentId: async (appointmentId: string): Promise<ApiResponse<ConsultationResponse>> => {
    const response = await api.get(`/consultations/appointment/${appointmentId}`);
    return response.data;
  },

  getByPetId: async (
    petId: string,
    params?: { page?: number; size?: number }
  ): Promise<ApiResponse<PageResponse<ConsultationResponse>>> => {
    const response = await api.get(`/consultations/pet/${petId}`, { params });
    return response.data;
  },
};
