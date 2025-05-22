import apiClient from './client';

export interface Transaction {
  _id?: string
  transactionNumber?: string
  date: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  relatedTo?: {
    type: 'order' | 'purchase' | 'other'
    id: string
  }
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other'
  status: 'completed' | 'pending' | 'cancelled'
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export const transactionService = {
  async getTransactions(filters?: { 
    startDate?: string, 
    endDate?: string, 
    type?: string, 
    category?: string, 
    status?: string 
  }): Promise<Transaction[]> {
    const response = await apiClient.get('/transactions', { params: filters })
    return response.data
  },

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/transactions/${id}`)
    return response.data
  },

  async createTransaction(transaction: Omit<Transaction, '_id'>): Promise<Transaction> {
    const response = await apiClient.post('/transactions', transaction)
    return response.data
  },

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await apiClient.put(`/transactions/${id}`, transaction)
    return response.data
  },

  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`)
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get('/transactions/categories')
    return response.data
  }
}
