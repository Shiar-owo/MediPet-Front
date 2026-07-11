import type { AppointmentStatus, PaginationParams } from '@/shared/types';

export interface AppointmentResponse {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  status: AppointmentStatus;
  cancelReason?: string;
  petId: string;
  clientId: string;
  veterinarianId: string;
  active: boolean;
}

export interface AppointmentRequest {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
  petId: string;
  clientId: string;
  veterinarianId: string;
}

export interface UpdateAppointmentRequest {
  date?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}

export interface CancelAppointmentRequest {
  reason?: string;
}

export interface AppointmentSearchParams extends PaginationParams {
  date?: string;
}
