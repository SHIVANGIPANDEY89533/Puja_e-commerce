import api from './api';

export interface Banner {
  _id: string;
  title: string;
  image: string;
  redirectUrl?: string;
  displayPosition: 'Home' | 'Category' | 'Product' | 'Global';
  priority: number;
  startDate?: string;
  endDate?: string;
  status: 'Active' | 'Inactive';
}

export const bannerService = {
  getBanners: async (position?: string): Promise<Banner[]> => {
    try {
      let url = '/banners';
      if (position) url += `?position=${position}`;
      
      const response = await api.get<Banner[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },

  getAllBanners: async (): Promise<Banner[]> => {
    const response = await api.get<Banner[]>('/banners/all');
    return response.data;
  },

  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const response = await api.post<Banner>('/banners', data);
    return response.data;
  },

  updateBanner: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const response = await api.put<Banner>(`/banners/${id}`, data);
    return response.data;
  },

  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/banners/${id}`);
  }
};
