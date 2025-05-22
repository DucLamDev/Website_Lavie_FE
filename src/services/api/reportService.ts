import apiClient from './client';

export interface SalesReport {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  dailySales: {
    date: string
    sales: number
    orders: number
  }[]
  topProducts: {
    productId: string
    productName: string
    quantity: number
    revenue: number
  }[]
  topCustomers: {
    customerId: string
    customerName: string
    orders: number
    spend: number
  }[]
}

export interface CustomerDebtReport {
  totalDebt: number
  totalCustomers: number
  pendingOrders: number
  customerDebts: {
    customerId: string
    customerName: string
    customerPhone: string
    totalDebt: number
    lastOrderDate: string
    pendingOrders: number
  }[]
  debtByTime: {
    date: string
    amount: number
  }[]
}

export interface SupplierDebtReport {
  totalDebt: number
  totalSuppliers: number
  pendingPayments: number
  supplierDebts: {
    supplierId: string
    supplierName: string
    supplierPhone: string
    totalDebt: number
    lastPurchaseDate: string
    pendingPayments: number
  }[]
  debtByTime: {
    date: string
    amount: number
  }[]
}

export interface FinancialReport {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  dailyFinancials: {
    date: string
    revenue: number
    expenses: number
    profit: number
  }[]
  revenueByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  expensesByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
}

export interface DailyRevenueReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalDebt: number;
  orders: {
    id: string;
    customer: string;
    total: number;
    paid: number;
    debt: number;
    date: string;
  }[];
}

export interface MonthlyRevenueReport {
  month: number;
  year: number;
  totalRevenue: number;
  totalOrders: number;
  totalPaid: number;
  totalDebt: number;
  dailyStats: {
    date: string;
    totalRevenue: number;
    totalOrders: number;
    totalPaid: number;
    totalDebt: number;
  }[];
}

export interface InventoryReport {
  summary: {
    totalProducts: number
    totalInventoryValue: number
    lowStockCount: number
    outOfStockCount: number
    returnablePending: number
  }
  lowStockProducts: {
    _id: string
    productId: string
    productName: string
    inStock: number
    reorderLevel: number
    price: number
  }[]
  outOfStockProducts: {
    _id: string
    productId: string
    productName: string
    inStock: number
    reorderLevel: number
    price: number
  }[]
  mostStockedProducts: {
    _id: string
    productId: string
    productName: string
    inStock: number
    reorderLevel: number
    price: number
  }[]
  stockMovements: {
    date: string
    type: 'in' | 'out'
    quantity: number
    productId: string
    productName: string
  }[]
}

export interface BestSellingProduct {
  _id: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  unit?: string;
  price?: number;
}

export const reportService = {
  async getSalesReport(params: { startDate?: string, endDate?: string }): Promise<SalesReport> {
    const response = await apiClient.get('/reports/sales', { params })
    return response.data
  },

  async getCustomerDebtReport(params?: { startDate?: string, endDate?: string }): Promise<CustomerDebtReport> {
    const response = await apiClient.get('/reports/customer-debt', { params })
    return response.data
  },

  async getSupplierDebtReport(params?: { startDate?: string, endDate?: string }): Promise<SupplierDebtReport> {
    const response = await apiClient.get('/reports/supplier-debt', { params })
    return response.data
  },

  async getFinancialReport(params: { startDate?: string, endDate?: string }): Promise<FinancialReport> {
    const response = await apiClient.get('/reports/financial', { params })
    return response.data
  },

  // New API endpoints
  async getDailyRevenue(date?: string): Promise<DailyRevenueReport> {
    const params = date ? { date } : {}
    const response = await apiClient.get('/reports/revenue/daily', { params })
    return response.data
  },

  async getMonthlyRevenue(year?: number, month?: number): Promise<MonthlyRevenueReport> {
    const params: Record<string, number> = {}
    if (year) params['year'] = year
    if (month) params['month'] = month
    const response = await apiClient.get('/reports/revenue/monthly', { params })
    return response.data
  },

  async getBestSellingProducts(params?: { limit?: number, startDate?: string, endDate?: string }): Promise<BestSellingProduct[]> {
    const response = await apiClient.get('/reports/products/best-selling', { params })
    return response.data
  },

  async getInventoryReport(): Promise<InventoryReport> {
    const response = await apiClient.get('/reports/inventory')
    return response.data
  },

  // PDF generation using jsreport
  async generateInvoicePdf(orderId: string): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      // Add token directly to the URL as a query parameter
      const url = `http://localhost:5000/api/reports/invoice/${orderId}?token=${token}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate invoice PDF: ${response.status}`);
      }

      // Create a blob URL for the PDF
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      throw error;
    }
  },

  async generateCustomerDebtReportPdf(params?: { startDate?: string, endDate?: string }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      // Add token to query parameters
      queryParams.append('token', token || '');

      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/reports/customer-debt/export?token=${token}`;
      
      // Trả về URL trực tiếp thay vì xử lý blob
      return url;
    } catch (error) {
      console.error('Error generating customer debt report PDF:', error);
      throw error;
    }
  },

  async generateSupplierDebtReportPdf(params?: { startDate?: string, endDate?: string }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      // Add token to query parameters
      queryParams.append('token', token || '');

      const queryString = queryParams.toString();
      const url = `http://localhost:5000/api/reports/supplier-debt/export?token=${token}`;
      
      // Trả về URL trực tiếp thay vì xử lý blob
      return url;
    } catch (error) {
      console.error('Error generating supplier debt report PDF:', error);
      throw error;
    }
  },

  async generateSalesReportPdf(params?: { startDate?: string, endDate?: string }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      // Add token to query parameters
      queryParams.append('token', token || '');

      // Use the correct endpoint for sales report
      const url = `http://localhost:5000/api/reports/sales/export?token=${token}`;

      // Return URL directly instead of processing blob
      return url;
    } catch (error) {
      console.error('Error generating sales report PDF:', error);
      throw error;
    }
  },

  async generateRevenueReportPdf(params?: { startDate?: string, endDate?: string }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      // Add token to query parameters
      queryParams.append('token', token || '');

      // Use the correct endpoint for revenue report
      const url = `http://localhost:5000/api/reports/revenue/export?token=${token}`;

      return url;
    } catch (error) {
      console.error('Error generating revenue report PDF:', error);
      throw error;
    }
  },

  async generateInventoryReportPdf(): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      // Add token directly to the URL as a query parameter
      const url = `http://localhost:5000/api/reports/inventory/export?token=${token}`;
      
      // Trả về URL trực tiếp thay vì xử lý blob
      return url;
    } catch (error) {
      console.error('Error generating inventory report PDF:', error);
      throw error;
    }
  },

  async generateBestSellingProductsReportPdf(params?: { startDate?: string, endDate?: string, limit?: number }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      // Add token to query parameters
      queryParams.append('token', token || '');

      // Use the correct endpoint for best selling products report
      const url = `http://localhost:5000/api/reports/products/best-selling/export?token=${token}`;
      
      return url;
    } catch (error) {
      console.error('Error generating best selling products report PDF:', error);
      throw error;
    }
  },

  async generateFinancialReportPdf(params?: { startDate?: string, endDate?: string }): Promise<string> {
    try {
      const token = localStorage.getItem('userToken');
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      // Add token to query parameters
      queryParams.append('token', token || '');

      // Use the correct endpoint for financial report
      const url = `http://localhost:5000/api/reports/financial/export?token=${token}`;
      
      return url;
    } catch (error) {
      console.error('Error generating financial report PDF:', error);
      throw error;
    }
  }
}
