import apiClient from './client';

export interface Order {
  _id: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: 'completed' | 'pending' | 'canceled';
  totalAmount: number;
  paidAmount: number;
  debtRemaining: number;
  returnableOut: number;
  returnableIn: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  _id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderCreate {
  customerId?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  note?: string;
  orderItems?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  items?: {
    product: string;
    quantity: number;
    returnable_quantity?: number;
    price: number;
  }[];
  status?: string;
  totalAmount?: number;
  depositAmount?: number; // Tiền cọc vỏ bình
  totalPayment?: number;  // Tổng thanh toán (bao gồm tiền cọc)
  paidAmount?: number;
  created_by?: string;
  staffId?: string;
  staffName?: string;
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const response = await apiClient.get(`/orders/${orderId}/items`);
    return response.data;
  },

  async createOrder(orderData: OrderCreate): Promise<Order> {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  async updateOrderStatus(id: string, status: 'completed' | 'pending' | 'canceled'): Promise<Order> {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  async updatePayment(id: string, paidAmount: number): Promise<Order> {
    const response = await apiClient.put(`/orders/${id}/payment`, { amount: paidAmount });
    return response.data;
  },

  async updateReturnable(id: string, returnableIn: number): Promise<Order> {
    const response = await apiClient.put(`/orders/${id}/returnable`, { returnableIn });
    return response.data;
  },

  async deleteOrder(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
