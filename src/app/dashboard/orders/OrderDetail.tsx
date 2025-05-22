'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FaMoneyBillWave, FaExchangeAlt, FaFileInvoice, FaPrint } from 'react-icons/fa'
import { orderService, Order, OrderItem } from '@/services/api/orderService'
import { toast } from 'react-toastify'
import { saveInvoicePDF, printInvoicePDF } from '@/utils/pdfUtils'
import InvoiceGenerator from '@/components/invoice/InvoiceGenerator'

type OrderDetailProps = {
  order: Order
  onUpdateStatusAction: (orderId: string, newStatus: 'completed' | 'pending' | 'canceled') => void
  onUpdatePaymentAction: (orderId: string, newPaidAmount: number) => void
  onUpdateReturnableAction: (orderId: string, newReturnableIn: number) => void
  onCloseAction: () => void
}

export default function OrderDetail({ order, onUpdateStatusAction, onUpdatePaymentAction, onUpdateReturnableAction, onCloseAction }: OrderDetailProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReturnableModal, setShowReturnableModal] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [returnableAmount, setReturnableAmount] = useState(0)
  
  useEffect(() => {
    fetchOrderItems()
  }, [order._id])
  
  const fetchOrderItems = async () => {
    setIsLoading(true)
    
    try {
      const items = await orderService.getOrderItems(order._id)
      setOrderItems(items)
    } catch (error: any) {
      console.error('Error fetching order items:', error)
      toast.error(`Lỗi khi tải chi tiết đơn hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const newPaidAmount = order.paidAmount + paymentAmount
      await orderService.updatePayment(order._id, newPaidAmount)
      onUpdatePaymentAction(order._id, newPaidAmount)
      setShowPaymentModal(false)
      toast.success('Cập nhật thanh toán thành công')
    } catch (error: any) {
      console.error('Error updating payment:', error)
      toast.error(`Lỗi khi cập nhật thanh toán: ${error.message || 'Unknown error'}`)
    }
  }
  
  const handleUpdateReturnable = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newReturnableIn = order.returnableIn + returnableAmount
      await orderService.updateReturnable(order._id, newReturnableIn)
      onUpdateReturnableAction(order._id, newReturnableIn)
      setShowReturnableModal(false)
      toast.success('Cập nhật vỏ hoàn trả thành công')
    } catch (error: any) {
      console.error('Error updating returnable containers:', error)
      toast.error(`Lỗi khi cập nhật vỏ hoàn trả: ${error.message || 'Unknown error'}`)
    }
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Đang xử lý'
      case 'canceled':
        return 'Đã hủy'
      default:
        return status
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thông tin đơn hàng</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Mã đơn:</span>
              <span className="font-medium text-gray-900 dark:text-white">{order._id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Khách hàng:</span>
              <span className="font-medium text-gray-900 dark:text-white">{order.customerName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Ngày đặt:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Thanh toán</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Tổng tiền:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Đã thanh toán:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Còn nợ:</span>
              <span className={`font-medium ${order.debtRemaining > 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.debtRemaining)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Vỏ xuất/trả:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {order.returnableIn}/{order.returnableOut}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">
          Chi tiết đơn hàng
        </h3>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-400 border-t-transparent"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đơn giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orderItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Tổng cộng:</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        {order.status === 'pending' && (
          <button
            onClick={() => onUpdateStatusAction(order._id, 'completed')}
            className="btn btn-primary flex items-center justify-center"
          >
            Hoàn thành đơn hàng
          </button>
        )}
        
        {order.debtRemaining > 0 && (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-secondary flex items-center justify-center"
          >
            <FaMoneyBillWave className="mr-2" />
            Cập nhật thanh toán
          </button>
        )}
        
        {order.returnableOut > order.returnableIn && (
          <button
            onClick={() => setShowReturnableModal(true)}
            className="btn btn-outline flex items-center justify-center"
          >
            <FaExchangeAlt className="mr-2" />
            Cập nhật vỏ hoàn trả
          </button>
        )}
        
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="btn btn-success flex items-center justify-center"
          disabled={isLoading}
        >
          <FaFileInvoice className="mr-2" />
          Tạo & In hóa đơn
        </button>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cập nhật thanh toán</h2>
            
            <form onSubmit={handleUpdatePayment}>
              <div className="space-y-4">
                <div>
                  <label className="label">Số tiền đã thanh toán</label>
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount)}
                  </div>
                </div>
                
                <div>
                  <label className="label">Số tiền còn nợ</label>
                  <div className="text-lg font-medium text-red-500 mb-2">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.debtRemaining)}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="payment" className="label">Số tiền thanh toán thêm</label>
                  <input
                    type="number"
                    id="payment"
                    className="input"
                    placeholder="Nhập số tiền"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    min="0"
                    max={order.debtRemaining}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Returnable Modal */}
      {showReturnableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Cập nhật vỏ hoàn trả</h2>
            
            <form onSubmit={handleUpdateReturnable}>
              <div className="space-y-4">
                <div>
                  <label className="label">Vỏ đã xuất</label>
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {order.returnableOut}
                  </div>
                </div>
                
                <div>
                  <label className="label">Vỏ đã trả</label>
                  <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {order.returnableIn}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="returnable" className="label">Số vỏ trả thêm</label>
                  <input
                    type="number"
                    id="returnable"
                    className="input"
                    placeholder="Nhập số vỏ"
                    value={returnableAmount}
                    onChange={(e) => setReturnableAmount(Number(e.target.value))}
                    min="0"
                    max={order.returnableOut - order.returnableIn}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowReturnableModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Invoice Generator Modal */}
      {showInvoiceModal && (
        <InvoiceGenerator 
          order={order} 
          orderItems={orderItems} 
          onCloseAction={() => setShowInvoiceModal(false)} 
        />
      )}
    </div>
  )
}
