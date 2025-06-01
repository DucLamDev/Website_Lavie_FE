'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { orderService, Order, OrderItem } from '@/services/api/orderService'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/utils/formatters'

interface OrderDetailModalProps {
  orderId: string
  isOpen: boolean
  onCloseAction: () => void
  onOrderUpdatedAction: () => void
}

export default function OrderDetailModal({ orderId, isOpen, onCloseAction, onOrderUpdatedAction }: OrderDetailModalProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalType, setModalType] = useState<null | 'payment' | 'returnable'>(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [returnableAmount, setReturnableAmount] = useState(0)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      const orderData = await orderService.getOrderById(orderId)
      setOrder(orderData)
      
      const items = await orderService.getOrderItems(orderId)
      setOrderItems(items)
    } catch (error: any) {
      console.error('Error fetching order details:', error)
      toast.error(`Lỗi khi tải thông tin đơn hàng: ${error.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!order) return
    
    try {
      await orderService.updateOrderStatus(order._id, 'completed')
      toast.success('Đơn hàng đã được hoàn thành')
      onOrderUpdatedAction()
      onCloseAction()
    } catch (error: any) {
      console.error('Error completing order:', error)
      toast.error(`Lỗi khi hoàn thành đơn hàng: ${error.message || 'Unknown error'}`)
    }
  }

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    
    try {
      await orderService.updatePayment(order._id, paymentAmount)
      toast.success('Cập nhật thanh toán thành công')
      setModalType(null)
      fetchOrderDetails()
      onOrderUpdatedAction()
    } catch (error: any) {
      console.error('Error updating payment:', error)
      toast.error(`Lỗi khi cập nhật thanh toán: ${error.message || 'Unknown error'}`)
    }
  }

  const handleUpdateReturnable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    
    try {
      await orderService.updateReturnable(order._id, returnableAmount)
      toast.success('Cập nhật vỏ hoàn trả thành công')
      setModalType(null)
      fetchOrderDetails()
      onOrderUpdatedAction()
    } catch (error: any) {
      console.error('Error updating returnable containers:', error)
      toast.error(`Lỗi khi cập nhật vỏ hoàn trả: ${error.message || 'Unknown error'}`)
    }
  }

  const handlePrintInvoice = () => {
    if (!order) return
    
    try {
      // Open invoice in a new window
      const token = localStorage.getItem('userToken')
      const baseUrl = window.location.origin
      const invoiceUrl = `http://localhost:5000/api/invoices/${order._id}?token=${token}`
      window.open(invoiceUrl, '_blank')
    } catch (error: any) {
      console.error('Error printing invoice:', error)
      toast.error(`Lỗi khi in hóa đơn: ${error.message || 'Unknown error'}`)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (isLoading || !order) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onCloseAction}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onCloseAction}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {modalType === null && (
                  <>
                    <div className="flex justify-between items-start">
                      <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                        Chi tiết đơn hàng {order._id}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={onCloseAction}
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Order Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Mã đơn:</span>
                            <span className="font-medium">{order._id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Khách hàng:</span>
                            <span className="font-medium">{order.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Ngày đặt:</span>
                            <span className="font-medium">
                              {format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Trạng thái:</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Thanh toán</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tổng tiền:</span>
                            <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Đã thanh toán:</span>
                            <span className="font-medium">{formatCurrency(order.paidAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Còn nợ:</span>
                            <span className="font-medium text-red-600">{formatCurrency(order.debtRemaining)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Vỏ xuất/trả:</span>
                            <span className="font-medium">{order.returnableIn}/{order.returnableOut}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Chi tiết đơn hàng</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sản phẩm
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số lượng
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đơn giá
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {orderItems.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                  Không có dữ liệu sản phẩm
                                </td>
                              </tr>
                            ) : (
                              orderItems.map((item) => (
                                <tr key={item._id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.productName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(item.unitPrice)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatCurrency(item.total)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                Tổng cộng:
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(order.totalAmount)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                      <button
                        type="button"
                        onClick={handleCompleteOrder}
                        disabled={order.status === 'completed'}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Hoàn thành đơn hàng
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentAmount(0)
                          setModalType('payment')
                        }}
                        disabled={order.debtRemaining <= 0}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cập nhật thanh toán
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnableAmount(0)
                          setModalType('returnable')
                        }}
                        disabled={order.returnableOut <= order.returnableIn}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cập nhật vỏ hoàn trả
                      </button>
                      <button
                        type="button"
                        onClick={handlePrintInvoice}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Tạo & In hóa đơn
                      </button>
                    </div>
                  </>
                )}
                {modalType === 'payment' && (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Cập nhật thanh toán
                    </Dialog.Title>
                    <form onSubmit={handleUpdatePayment}>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Tổng tiền</label>
                          <div className="mt-1 text-lg font-medium text-gray-900">
                            {formatCurrency(order?.totalAmount || 0)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Đã thanh toán</label>
                          <div className="mt-1 text-lg font-medium text-gray-900">
                            {formatCurrency(order?.paidAmount || 0)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Còn nợ</label>
                          <div className="mt-1 text-lg font-medium text-red-600">
                            {formatCurrency((order?.totalAmount || 0) - (order?.paidAmount || 0))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="payment" className="block text-sm font-medium text-gray-900">
                            Số tiền thanh toán thêm
                          </label>
                          <input
                            type="number"
                            id="payment"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                            placeholder="Nhập số tiền"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            min="0"
                            max={(order?.totalAmount || 0) - (order?.paidAmount || 0)}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          onClick={() => setModalType(null)}
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </form>
                  </>
                )}
                {modalType === 'returnable' && (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Cập nhật vỏ hoàn trả
                    </Dialog.Title>
                    <form onSubmit={handleUpdateReturnable}>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Vỏ đã xuất</label>
                          <div className="mt-1 text-lg font-medium text-gray-900">{order?.returnableOut || 0}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900">Vỏ đã trả</label>
                          <div className="mt-1 text-lg font-medium text-gray-900">{order?.returnableIn || 0}</div>
                        </div>
                        <div>
                          <label htmlFor="returnable" className="block text-sm font-medium text-gray-900">
                            Số vỏ trả thêm
                          </label>
                          <input
                            type="number"
                            id="returnable"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-gray-900"
                            placeholder="Nhập số vỏ"
                            value={returnableAmount}
                            onChange={(e) => setReturnableAmount(Number(e.target.value))}
                            min="0"
                            max={(order?.returnableOut || 0) - (order?.returnableIn || 0)}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          onClick={() => setModalType(null)}
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          Cập nhật
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
