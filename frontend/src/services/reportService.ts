import api from './api';

export const reportService = {
  getAnalytics: async (range: string = 'all') => {
    const response = await api.get(`/reports/analytics?range=${range}`);
    return response.data;
  },
};
