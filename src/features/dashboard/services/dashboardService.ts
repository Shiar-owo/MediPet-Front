import api from '@/shared/lib/api';
import type { ApiResponse } from '@/shared/types';
import type { DashboardStatsResponse } from '../types';

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
