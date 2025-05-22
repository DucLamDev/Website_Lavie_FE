'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaFileInvoice, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { inventoryService, Purchase } from '@/services/api/inventoryService'
import { supplierService, Supplier } from '@/services/api/supplierService'
import PurchaseDetail from './PurchaseDetail'
import NewPurchaseForm from './NewPurchaseForm'

export default function InventoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
  }, [])
  
  const fetchPurchases = async () => {
    setIsLoading(true)
    try {
      const data = await inventoryService.getPurchases()
      setPurchases(data)
    } catch (error: any) {
      console.error('Error fetching purchases:', error)
      toast.error(`Lỗi khi tải danh sách đơn nhập hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getSuppliers()
      setSuppliers(data)
    } catch (error: any) {
      console.error('Error fetching suppliers:', error)
      toast.error(`Lỗi khi tải danh sách nhà cung cấp: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handlePurchaseCreated = (purchase: Purchase) => {
    setPurchases([purchase, ...purchases])
    setShowAddModal(false)
    toast.success('Tạo đơn nhập hàng thành công!')
  }
  
  const handlePurchaseUpdated = (updatedPurchase: Purchase) => {
    setPurchases(purchases.map(purchase => 
      purchase._id === updatedPurchase._id ? updatedPurchase : purchase
    ))
    setShowDetailModal(false)
    toast.success('Cập nhật đơn nhập hàng thành công!')
  }
  
  const handleStatusChange = async (purchaseId: string, newStatus: 'pending' | 'received' | 'cancelled') => {
    try {
      const updatedPurchase = await inventoryService.updatePurchaseStatus(
        purchaseId,
        newStatus,
        newStatus === 'received' ? new Date().toISOString() : undefined
      )
      
      setPurchases(purchases.map(purchase => 
        purchase._id === purchaseId ? updatedPurchase : purchase
      ))
      
      toast.success(`Cập nhật trạng thái thành công: ${
        newStatus === 'pending' ? 'Đang chờ' : 
        newStatus === 'received' ? 'Đã nhận hàng' : 'Đã hủy'
      }`)
    } catch (error: any) {
      console.error('Error updating purchase status:', error)
      toast.error(`Lỗi khi cập nhật trạng thái: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) {
      return
    }
    
    try {
      await inventoryService.deletePurchase(purchaseId)
      setPurchases(purchases.filter(purchase => purchase._id !== purchaseId))
      toast.success('Xóa đơn nhập hàng thành công!')
    } catch (error: any) {
      console.error('Error deleting purchase:', error)
      toast.error(`Lỗi khi xóa đơn nhập hàng: ${error.message || 'Unknown error'}`)
    }
  }
  
  const viewPurchaseDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setShowDetailModal(true)
  }
  
  // Filter purchases based on search term and status
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      (purchase.purchaseNumber && purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (purchase.supplier && purchase.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = 
      statusFilter === 'all' || 
      purchase.status === statusFilter
    
    return matchesSearch && matchesStatus
  })
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }
  
  // Get supplier name by ID
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s._id === supplierId)
    return supplier ? supplier.name : 'Unknown Supplier'
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhập hàng</h1>
        <button
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="mr-2" />
          Tạo đơn nhập hàng
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tìm theo mã đơn hoặc nhà cung cấp"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang chờ</option>
                <option value="received">Đã nhận hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Purchases List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm || statusFilter !== 'all' ? 
              'Không tìm thấy đơn nhập hàng phù hợp với bộ lọc.' : 
              'Chưa có đơn nhập hàng nào. Hãy tạo đơn nhập hàng đầu tiên!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã thanh toán
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.purchaseNumber || `PO-${purchase._id?.slice(-6)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {purchase.supplier?.name || getSupplierName(purchase.supplierId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(purchase.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(purchase.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(purchase.paidAmount)}
                      </div>
                      {purchase.paidAmount < purchase.totalAmount && (
                        <div className="text-xs text-red-600">
                          Còn lại: {formatCurrency(purchase.totalAmount - purchase.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        purchase.status === 'received' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status === 'pending' ? 'Đang chờ' : 
                         purchase.status === 'received' ? 'Đã nhận hàng' : 
                         'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => viewPurchaseDetails(purchase)}
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        
                        {purchase.status === 'pending' && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleStatusChange(purchase._id!, 'received')}
                              title="Đánh dấu đã nhận hàng"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleStatusChange(purchase._id!, 'cancelled')}
                              title="Hủy đơn nhập hàng"
                            >
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        
                        {purchase.status === 'pending' && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeletePurchase(purchase._id!)}
                            title="Xóa đơn nhập hàng"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Purchase Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết đơn nhập hàng</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDetailModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <PurchaseDetail 
              purchase={selectedPurchase} 
              onUpdate={handlePurchaseUpdated} 
            />
          </div>
        </div>
      )}
      
      {/* Add New Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo đơn nhập hàng mới</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <NewPurchaseForm 
              onPurchaseCreatedAction={handlePurchaseCreated} 
              onCancelAction={() => setShowAddModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
