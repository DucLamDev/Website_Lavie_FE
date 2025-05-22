import apiClient from './client';

export interface DashboardStats {
  customers: number;
  products: number;
  orders: number;
  revenue: number;
  ordersByDay: {
    labels: string[];
    data: number[];
  };
  revenueByProduct: {
    labels: string[];
    data: number[];
  };
  recentOrders: {
    _id: string;
    customerName: string;
    orderDate: string;
    status: string;
    totalAmount: number;
  }[];
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};

export default dashboardService;
