import apiClient from './client';
import { Product } from './productService'
import { Supplier } from './supplierService'

export interface Purchase {
  _id?: string
  purchaseNumber?: string
  supplierId: string
  supplier?: Supplier
  items: PurchaseItem[]
  totalAmount: number
  paidAmount: number
  balance?: number
  status: 'pending' | 'received' | 'cancelled'
  receivedDate?: string
  note?: string
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseItem {
  productId: string
  product?: Product
  quantity: number
  price: number
  subtotal: number
}

export interface StockMovement {
  _id?: string
  productId: string
  product?: Product
  type: 'purchase' | 'sales' | 'adjustment' | 'return'
  quantity: number
  referenceId?: string
  referenceType?: string
  note?: string
  createdBy?: string
  createdAt?: string
}

export interface InventorySummary {
  _id?: string
  productId: string
  product?: Product
  inStock: number
  returnablePending: number
  lastUpdated?: string
}

export interface InventoryReportItem {
  productId: string
  productName: string
  currentStock: number
  stockMovements: {
    import: number
    export: number
    return: number
  }
  netChange: number
  logs: {
    date: string
    type: string
    quantity: number
    note: string
  }[]
}

export interface InventoryReport {
  startDate: string
  endDate: string
  products: InventoryReportItem[]
}

export const inventoryService = {
  // Purchase Orders (Incoming stock)
  async getPurchases(): Promise<Purchase[]> {
    const response = await apiClient.get('/inventory/purchases')
    return response.data
  },

  async getPurchase(id: string): Promise<Purchase> {
    const response = await apiClient.get(`/inventory/purchases/${id}`)
    return response.data
  },

  async createPurchase(purchase: Omit<Purchase, '_id'>): Promise<Purchase> {
    const response = await apiClient.post('/inventory/purchases', purchase)
    return response.data
  },

  async updatePurchase(id: string, purchase: Partial<Purchase>): Promise<Purchase> {
    const response = await apiClient.put(`/inventory/purchases/${id}`, purchase)
    return response.data
  },

  async updatePurchaseStatus(id: string, status: 'pending' | 'received' | 'cancelled', receivedDate?: string): Promise<Purchase> {
    const response = await apiClient.put(`/inventory/purchases/${id}/status`, { status, receivedDate })
    return response.data
  },

  async updatePurchasePayment(id: string, paidAmount: number): Promise<Purchase> {
    const response = await apiClient.put(`/inventory/purchases/${id}/payment`, { paidAmount })
    return response.data
  },

  async deletePurchase(id: string): Promise<void> {
    await apiClient.delete(`/inventory/purchases/${id}`)
  },

  // Stock Movements
  async getStockMovements(filters?: { productId?: string, type?: string, startDate?: string, endDate?: string }): Promise<StockMovement[]> {
    const response = await apiClient.get('/inventory/movements', { params: filters })
    return response.data
  },

  async createStockMovement(movement: Omit<StockMovement, '_id'>): Promise<StockMovement> {
    const response = await apiClient.post('/inventory/movements', movement)
    return response.data
  },

  // Inventory Summary
  async getInventorySummary(): Promise<InventorySummary[]> {
    const response = await apiClient.get('/inventory/summary')
    return response.data
  },

  async getProductInventory(productId: string): Promise<InventorySummary> {
    const response = await apiClient.get(`/inventory/summary/${productId}`)
    return response.data
  },

  async adjustInventory(productId: string, adjustment: number, note: string): Promise<InventorySummary> {
    const response = await apiClient.post('/inventory/adjust', { productId, adjustment, note })
    return response.data
  },

  // Inventory Reports by Date
  async getInventoryReportByDate(startDate: string, endDate: string): Promise<InventoryReport> {
    const response = await apiClient.get('/inventory/report/date', { 
      params: { startDate, endDate } 
    })
    return response.data
  },

  async exportInventoryReportByDate(startDate: string, endDate: string): Promise<string> {
    const token = localStorage.getItem('userToken')
    return `${process.env.NEXT_PUBLIC_API_URL}/inventory/report/date/export?startDate=${startDate}&endDate=${endDate}&token=${token}`
  },

  async exportInventoryReport(): Promise<string> {
    const token = localStorage.getItem('userToken')
    return `${process.env.NEXT_PUBLIC_API_URL}/reports/inventory/export?token=${token}`
  }
}
