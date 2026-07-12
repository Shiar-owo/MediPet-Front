import type { AppointmentResponse } from '@/features/appointments/types';

export interface DashboardStatsResponse {
  totalClients: number;
  totalPets: number;
  appointmentsToday: number;
  appointmentsThisMonth: number;
  upcomingAppointments: AppointmentResponse[];
}
