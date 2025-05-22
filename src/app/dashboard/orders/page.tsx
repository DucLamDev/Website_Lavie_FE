'use client'

import { useState, useEffect } from 'react'
import { 
  FaPlus, 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaPrint, 
  FaTrash, 
  FaFilter,
  FaShoppingCart,
  FaMoneyBillWave
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { NewOrderForm } from './index'
import OrderDetailModal from './OrderDetailModal'
import { orderService, Order } from '@/services/api/orderService'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'canceled'>('all')
  
  useEffect(() => {
    fetchOrders()
  }, [])
  
  const fetchOrders = async () => {
    setIsLoading(true)
    
    try {
      const data = await orderService.getOrders()
      setOrders(data)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      toast.error(`Lỗi khi tải danh sách đơn hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleViewOrderDetail = (order: Order) => {
    setSelectedOrderId(order._id)
    setShowDetailModal(true)
  }
  
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'completed' | 'pending' | 'canceled') => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === orderId
          ? { ...order, status: newStatus }
          : order
      )
      
      setOrders(updatedOrders)
      toast.success(`Cập nhật trạng thái đơn hàng ${orderId} thành công`)
    } catch (error: any) {
      console.error('Error updating order status:', error)
      toast.error(`Lỗi khi cập nhật trạng thái đơn hàng: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleUpdatePayment = async (orderId: string, newPaidAmount: number) => {
    try {
      const updatedOrder = await orderService.updatePayment(orderId, newPaidAmount)
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === orderId
          ? {
              ...order,
              paidAmount: updatedOrder.paidAmount,
              debtRemaining: updatedOrder.debtRemaining
            }
          : order
      )
      
      setOrders(updatedOrders)
      toast.success(`Cập nhật thanh toán đơn hàng ${orderId} thành công`)
    } catch (error: any) {
      console.error('Error updating payment:', error)
      toast.error(`Lỗi khi cập nhật thanh toán: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleUpdateReturnable = async (orderId: string, newReturnableIn: number) => {
    try {
      const updatedOrder = await orderService.updateReturnable(orderId, newReturnableIn)
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === orderId
          ? { ...order, returnableIn: updatedOrder.returnableIn }
          : order
      )
      
      setOrders(updatedOrders)
      toast.success(`Cập nhật vỏ hoàn trả đơn hàng ${orderId} thành công`)
    } catch (error: any) {
      console.error('Error updating returnable containers:', error)
      toast.error(`Lỗi khi cập nhật vỏ hoàn trả: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) return
    
    try {
      await orderService.deleteOrder(orderId)
      
      // Update local state
      setOrders(orders.filter(order => order._id !== orderId))
      toast.success(`Xóa đơn hàng ${orderId} thành công`)
    } catch (error: any) {
      console.error('Error deleting order:', error)
      toast.error(`Lỗi khi xóa đơn hàng: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleOrderCreated = (newOrder: Order) => {
    // The actual API call is made in the NewOrderForm component
    // Here we just update the local state with the returned order from API
    
    // Check if we need to refresh the entire order list
    if (newOrder._id === 'refresh-needed') {
      // Refresh the entire orders list
      fetchOrders()
      setShowAddModal(false)
      toast.success('Tạo đơn hàng mới thành công')
    } else {
      // Just add the new order to the list
      setOrders([newOrder, ...orders])
      setShowAddModal(false)
      toast.success('Tạo đơn hàng mới thành công')
    }
  }
  
  const filteredOrders = orders
    .filter(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(order => 
      statusFilter === 'all' ? true : order.status === statusFilter
    )
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Tạo đơn hàng mới
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Tìm kiếm mã đơn, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FaFilter className="text-gray-400 mr-2" />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-4 text-center">Loading...</div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Mã đơn</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[15%]">Khách hàng</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[12%]">Ngày đặt</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Trạng thái</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[12%]">Tổng tiền</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[12%]">Đã thanh toán</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[12%]">Công nợ</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[7%]">Vỏ xuất/trả</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-[10%]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{order._id}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{order.customerName}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {order.status === 'completed' 
                            ? 'Hoàn thành' 
                            : order.status === 'pending'
                              ? 'Đang xử lý'
                              : 'Đã hủy'
                          }
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className={`text-sm ${
                          order.debtRemaining > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'
                        }`}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.debtRemaining)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.returnableIn}/{order.returnableOut}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-1 justify-end">
                          <button
                            onClick={() => handleViewOrderDetail(order)}
                            className="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          
                          <button
                            onClick={() => {
                              const invoiceUrl = `http://localhost:5000/api/invoices/${order._id}?token=${localStorage.getItem('userToken')}`
                              window.open(invoiceUrl, '_blank')
                            }}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            title="In hóa đơn"
                          >
                            <FaPrint />
                          </button>
                          
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                                className="text-green-600 hover:text-green-900 dark:hover:text-green-400"
                                title="Hoàn thành đơn"
                              >
                                <FaMoneyBillWave />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                title="Xóa đơn"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-3 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* New Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tạo đơn hàng mới</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <NewOrderForm onOrderCreatedAction={handleOrderCreated} onCancelAction={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
      
      {/* Order Detail Modal */}
      {showDetailModal && selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          isOpen={showDetailModal}
          onCloseAction={() => setShowDetailModal(false)}
          onOrderUpdatedAction={fetchOrders}
        />
      )}
    </div>
  )
}
