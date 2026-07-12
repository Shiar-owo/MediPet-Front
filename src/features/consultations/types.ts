import type { PaginationParams } from '@/shared/types';

export interface ConsultationResponse {
  id: string;
  appointmentId: string;
  petId: string;
  petName: string;
  clientId: string;
  clientName: string;
  veterinarianId: string;
  veterinarianName: string;
  weight?: number;
  temperature?: number;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationRequest {
  appointmentId: string;
  petId: string;
  clientId: string;
  veterinarianId: string;
  weight?: number;
  temperature?: number;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

export interface ConsultationSearchParams extends PaginationParams {
  petId?: string;
}
