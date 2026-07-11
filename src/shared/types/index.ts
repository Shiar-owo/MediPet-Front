export type UserRole = 'ADMIN' | 'VETERINARIO' | 'RECEPCIONISTA';

export type PetSex = 'MALE' | 'FEMALE';

export type AppointmentStatus = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';

export interface ErrorBody {
  status: number;
  code: string;
  message: string;
  path: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ErrorBody;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
}
