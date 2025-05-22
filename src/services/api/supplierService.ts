import apiClient from './client';

export interface Supplier {
  _id?: string
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export const supplierService = {
  async getSuppliers(): Promise<Supplier[]> {
    const response = await apiClient.get('/suppliers')
    return response.data
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await apiClient.get(`/suppliers/${id}`)
    return response.data
  },

  async createSupplier(supplier: Omit<Supplier, '_id'>): Promise<Supplier> {
    const response = await apiClient.post('/suppliers', supplier)
    return response.data
  },

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.put(`/suppliers/${id}`, supplier)
    return response.data
  },

  async deleteSupplier(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`)
  }
}
